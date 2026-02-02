const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
const { spawn } = require('child_process');
const { updateBackendUrl } = require('./updateBackendUrl');

const LOCAL_PORT = process.env.PORT || 4500;
const CLOUDFLARED_PATH = process.env.CLOUDFLARED_PATH || 'cloudflared';

const URL_REGEX = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

let urlCaptured = false;
let tunnelProcess = null;

function startTunnel() {
  console.log(`[Tunnel] Starting cloudflared tunnel for localhost:${LOCAL_PORT}...`);
  
  tunnelProcess = spawn(CLOUDFLARED_PATH, [
    'tunnel',
    '--url', `http://localhost:${LOCAL_PORT}`
  ], {
    stdio: ['inherit', 'pipe', 'pipe']
  });

  tunnelProcess.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(`[cloudflared stdout] ${output}`);
    captureUrl(output);
  });

  tunnelProcess.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(`[cloudflared stderr] ${output}`);
    captureUrl(output);
  });

  tunnelProcess.on('close', (code) => {
    console.log(`[Tunnel] cloudflared process exited with code ${code}`);
    if (code !== 0) {
      console.log('[Tunnel] Restarting in 5 seconds...');
      setTimeout(startTunnel, 5000);
    }
  });

  tunnelProcess.on('error', (err) => {
    console.error('[Tunnel] Failed to start cloudflared:', err.message);
    console.error('[Tunnel] Make sure cloudflared is installed and in PATH');
    console.error('[Tunnel] Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/');
  });
}

function captureUrl(output) {
  if (urlCaptured) return;
  
  const match = output.match(URL_REGEX);
  if (match) {
    urlCaptured = true;
    const tunnelUrl = match[0];
    console.log(`\n[Tunnel] ✓ Captured tunnel URL: ${tunnelUrl}\n`);
    
    updateBackendUrl(tunnelUrl)
      .then(() => {
        console.log('[Tunnel] ✓ Backend URL published to Firebase');
        console.log('[Tunnel] Tunnel is now running. Press Ctrl+C to stop.');
      })
      .catch(err => {
        console.error('[Tunnel] ✗ Failed to update Firebase:', err.message);
        console.error('[Tunnel] The tunnel is still running, but frontends won\'t auto-discover the URL.');
      });
  }
}

process.on('SIGINT', () => {
  console.log('\n[Tunnel] Shutting down...');
  if (tunnelProcess) {
    tunnelProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Tunnel] Received SIGTERM, shutting down...');
  if (tunnelProcess) {
    tunnelProcess.kill();
  }
  process.exit(0);
});

startTunnel();
