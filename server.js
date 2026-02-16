// Simple proxy server - uses Cloudflare Worker
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 4500;

// Cloudflare Worker URL
const WORKER_URL = "https://blooket.mojhehmod.workers.dev";

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Proxy endpoint - forwards requests to Cloudflare Worker
app.post('/join', async (req, res) => {
    const { id, name } = req.body;
    console.log(`[JOIN] Game: ${id}, Name: ${name}`);

    if (!id || !name) {
        return res.json({ success: false, msg: "Missing id or name" });
    }

    try {
        const response = await fetch(WORKER_URL + '/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, name })
        });

        const data = await response.text();
        console.log(`[RESPONSE] Status: ${response.status}`);
        console.log(`[RESPONSE] Body: ${data.substring(0, 300)}`);

        try {
            const json = JSON.parse(data);
            res.json(json);
        } catch (e) {
            res.json({ success: false, msg: `Parse error: ${data.substring(0, 100)}` });
        }
    } catch (err) {
        console.log(`[ERROR] ${err.message}`);
        res.json({ success: false, msg: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'bot.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.get('/api/v1/features/environment', (req, res) => {
    res.json({});
});

app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});
