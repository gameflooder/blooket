// Blooket Bot Server with Playwright to bypass Cloudflare
// KEY: Makes the fetch request FROM WITHIN the browser page itself
const express = require('express');
const cors = require('cors');
const path = require('path');
const { chromium } = require('playwright');

const app = express();
const PORT = 4500;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Store browser instance and a ready page
let browser = null;
let readyPage = null;
let readyContext = null;

// Initialize browser
async function initBrowser() {
    if (browser) return;
    
    console.log('[INIT] Starting browser...');
    browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('[INIT] Browser started');
    
    // Create a context and pre-warm by visiting blooket
    await prepareReadyPage();
}

// Prepare a page that has passed Cloudflare and is ready to make requests
async function prepareReadyPage() {
    console.log('[PREP] Creating ready page...');
    
    if (readyContext) {
        try { await readyContext.close(); } catch(e) {}
    }
    
    readyContext = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    });
    
    readyPage = await readyContext.newPage();
    
    // Visit cryptohack.blooket.com (the origin used in successful requests)
    console.log('[PREP] Visiting cryptohack.blooket.com...');
    try {
        await readyPage.goto('https://cryptohack.blooket.com/', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        console.log('[PREP] Page loaded, waiting for CF challenge...');
        await readyPage.waitForTimeout(5000);
        console.log('[PREP] Ready page prepared!');
    } catch (e) {
        console.log('[PREP] Error:', e.message);
    }
}

// Join game by executing fetch from WITHIN the browser page
async function joinGameWithPlaywright(gameId, playerName) {
    if (!readyPage || readyPage.isClosed()) {
        await prepareReadyPage();
    }
    
    console.log(`[JOIN] Making request from browser for ${playerName}...`);
    
    try {
        // Execute fetch from within the browser page context
        // This means the browser itself (with its CF cookies/session) makes the request
        const result = await readyPage.evaluate(async ({ gameId, playerName }) => {
            try {
                const response = await fetch('https://fb.blooket.com/c/firebase/join', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*',
                    },
                    body: JSON.stringify({ id: gameId, name: playerName }),
                    credentials: 'include'
                });
                
                const text = await response.text();
                
                if (!response.ok) {
                    return { success: false, msg: `HTTP ${response.status}: ${text.substring(0, 100)}` };
                }
                
                try {
                    return JSON.parse(text);
                } catch (e) {
                    return { success: false, msg: `Invalid JSON: ${text.substring(0, 100)}` };
                }
            } catch (err) {
                return { success: false, msg: `Fetch error: ${err.message}` };
            }
        }, { gameId, playerName });
        
        console.log('[JOIN] Result:', JSON.stringify(result).substring(0, 150));
        return result;
        
    } catch (err) {
        console.log('[JOIN] Error:', err.message);
        // Page might be broken, refresh it
        await prepareReadyPage();
        return { success: false, msg: err.message };
    }
}

// Join endpoint
app.post('/join', async (req, res) => {
    const { id, name } = req.body;
    console.log(`[JOIN] Request - Game: ${id}, Name: ${name}`);

    if (!id || !name) {
        return res.json({ success: false, msg: "Missing id or name" });
    }

    try {
        const result = await joinGameWithPlaywright(id, name);
        res.json(result);
    } catch (err) {
        console.log(`[ERROR] ${err.message}`);
        res.json({ success: false, msg: err.message });
    }
});

// Refresh the ready page (for manual refresh if needed)
app.post('/refresh', async (req, res) => {
    console.log('[REFRESH] Refreshing ready page...');
    try {
        await prepareReadyPage();
        res.json({ success: true, msg: 'Page refreshed' });
    } catch (err) {
        res.json({ success: false, msg: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', browser: browser ? 'running' : 'stopped', page: readyPage ? 'ready' : 'not ready' });
});

// Cleanup on exit
process.on('SIGINT', async () => {
    if (browser) {
        await browser.close();
    }
    process.exit();
});

app.listen(PORT, async () => {
    console.log(`🚀 Playwright server running on http://localhost:${PORT}`);
    console.log('Initializing browser...');
    await initBrowser();
    console.log('Ready to accept requests!');
});
