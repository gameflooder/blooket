# Blooket Bot - Auto-Updating Backend URL System

This system uses Cloudflare's free quick tunnels to expose your local server to the internet, and automatically publishes the tunnel URL to GitHub so frontends can discover it.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  start-tunnel.js│────▶│ updateBackendUrl │────▶│  GitHub Repo    │
│  (cloudflared)  │     │     (API)        │     │  backend.json   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │◀────│  raw.github.com  │◀────│   User opens    │
│   (index.html)  │     │  (fetch URL)     │     │   page          │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Setup

### 1. Install cloudflared

Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

**Windows:**
```powershell
# Using winget
winget install Cloudflare.cloudflared

# Or download the .exe and add to PATH
```

**Mac:**
```bash
brew install cloudflared
```

**Linux:**
```bash
# Debian/Ubuntu
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new public repository named `blooket-backend-url`
3. Initialize with a README (or leave empty)

### 3. Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "blooket-tunnel-updater"
4. Select scopes:
   - `public_repo` (for public repos)
   - OR `repo` (for private repos)
5. Copy the token (starts with `ghp_`)

### 4. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-github-username
GITHUB_REPO=blooket-backend-url
PORT=4500
```

### 5. Update Frontend Configuration

Edit `script.js` and update these lines near the top:

```javascript
const GITHUB_BACKEND_URL_OWNER = "your-github-username";
const GITHUB_BACKEND_URL_REPO = "blooket-backend-url";
```

### 6. Install Dependencies

```bash
npm install
```

## Running

### Option 1: Manual Start (Development)

Terminal 1 - Start the server:
```bash
npm start
# or
node server-playwright.js
```

Terminal 2 - Start the tunnel:
```bash
npm run tunnel
# or
node start-tunnel.js
```

### Option 2: PM2 (Production)

Install PM2 globally:
```bash
npm install -g pm2
```

Start both services:
```bash
npm run start:all
# or
pm2 start ecosystem.config.js
```

View logs:
```bash
npm run logs
# or
pm2 logs
```

Stop all:
```bash
npm run stop:all
# or
pm2 stop all
```

Auto-start on boot:
```bash
pm2 startup
pm2 save
```

## How It Works

1. **start-tunnel.js** spawns `cloudflared tunnel --url http://localhost:4500`
2. Cloudflared outputs a random URL like `https://some-random-words.trycloudflare.com`
3. The script captures this URL using regex
4. **updateBackendUrl.js** pushes this URL to GitHub via the API
5. The frontend fetches `https://raw.githubusercontent.com/OWNER/REPO/main/backend.json`
6. Frontend uses the URL from the JSON for all API calls

## Files Created

| File | Purpose |
|------|---------|
| `start-tunnel.js` | Spawns cloudflared, captures URL, triggers update |
| `updateBackendUrl.js` | Pushes URL to GitHub via API |
| `ecosystem.config.js` | PM2 configuration for both processes |
| `.env.example` | Template for environment variables |

## Troubleshooting

### "cloudflared not found"
- Make sure cloudflared is installed and in your PATH
- Or set `CLOUDFLARED_PATH` in `.env` to the full path

### "GitHub API error 401"
- Check your token has the correct scopes
- Make sure the token hasn't expired

### "GitHub API error 404"
- Make sure the repository exists
- Check owner and repo name are correct

### Frontend shows "Using localhost"
- This means GitHub fetch failed
- Check browser console for errors
- Verify the raw GitHub URL is accessible

### Tunnel URL not captured
- Check cloudflared output for errors
- The URL pattern may have changed - check regex

## Security Notes

- **Never commit `.env`** - it contains your GitHub token
- The GitHub repo can be public (the URL is not sensitive)
- Cloudflare quick tunnels are free but temporary (restart = new URL)
- Consider using a named tunnel for permanent URLs
