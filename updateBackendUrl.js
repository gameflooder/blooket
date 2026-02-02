try { require('dotenv').config(); } catch (e) {}
const https = require('https');

const FIREBASE_DB_URL = 'procces-3efd9-default-rtdb.firebaseio.com';
const SERVICE_NAME = 'blooket';
const SERVICE_PORT = 4500;

function makeFirebaseRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: FIREBASE_DB_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`Firebase error ${res.statusCode}: ${json.error || data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function updateBackendUrl(newUrl) {
  console.log(`[Firebase] Updating ${SERVICE_NAME} backend URL to: ${newUrl}`);
  
  const content = {
    url: newUrl,
    updated: new Date().toISOString(),
    status: 'online',
    port: SERVICE_PORT
  };
  
  await makeFirebaseRequest(
    'PUT',
    `/backends/${SERVICE_NAME}.json`,
    content
  );
  
  console.log(`[Firebase] Successfully updated ${SERVICE_NAME} backend`);
}

if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node updateBackendUrl.js <url>');
    process.exit(1);
  }
  
  updateBackendUrl(url)
    .then(() => {
      console.log('[Firebase] Update complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('[Firebase] Error:', err.message);
      process.exit(1);
    });
}

module.exports = { updateBackendUrl };
