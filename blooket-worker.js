// BLOOKET BOT CLOUDFLARE WORKER
// 
// HOW TO DEPLOY:
// 1. Go to https://dash.cloudflare.com/ and sign up/login (FREE)
// 2. Click "Workers & Pages" in the left sidebar
// 3. Click "Create" button
// 4. Click "Create Worker"
// 5. Give it a name like "blooket-bot" 
// 6. Click "Deploy"
// 7. Click "Edit Code"
// 8. DELETE all the default code and PASTE this entire file
// 9. Click "Deploy" again
// 10. Copy your worker URL (looks like: https://blooket-bot.YOUR-NAME.workers.dev)
// 11. Update script.js line with OUR_BACKEND_URL to use your worker URL

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);
    
    // Main join endpoint
    if (url.pathname === "/join" && request.method === "POST") {
      try {
        const body = await request.json();
        
        // Try multiple potential Blooket endpoints
        const endpoints = [
          { url: "https://fb.blooket.com/c/firebase/join", method: "PUT", origin: "https://cryptohack.blooket.com" },
          { url: "https://fb.blooket.com/c/firebase/join", method: "PUT", origin: "https://play.blooket.com" },
          { url: "https://fb.blooket.com/c/firebase/join", method: "POST", origin: "https://cryptohack.blooket.com" },
          { url: "https://api.blooket.com/api/firebase/join", method: "PUT", origin: "https://www.blooket.com" },
          { url: "https://api.blooket.com/api/firebase/join", method: "POST", origin: "https://www.blooket.com" },
        ];
        
        let lastError = "";
        let debugInfo = [];
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint.url, {
              method: endpoint.method,
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.9",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
                "Origin": endpoint.origin,
                "Referer": endpoint.origin + "/",
                "sec-ch-ua": '"Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "prefer": "safe",
                "priority": "u=1, i",
              },
              body: JSON.stringify({
                id: body.id,
                name: body.name
              }),
            });

            const responseText = await response.text();
            debugInfo.push(`${endpoint.url}: ${response.status} - ${responseText.substring(0, 150)}`);
            
            // If we got a valid JSON response with fbToken, we found the right endpoint!
            if (responseText.includes("fbToken") || responseText.includes("fbShardURL")) {
              let data = JSON.parse(responseText);
              data.endpoint = endpoint.url; // Include which endpoint worked
              return new Response(JSON.stringify(data), {
                status: 200,
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
              });
            }
            
            // Check if it's a valid error response (not 404)
            if (response.status !== 404 && responseText.length > 0) {
              lastError = `${endpoint.url}: ${response.status} - ${responseText.substring(0, 100)}`;
            }
          } catch (e) {
            lastError = `${endpoint.url}: ${e.message}`;
          }
        }
        
        return new Response(JSON.stringify({ 
          success: false, 
          msg: "All endpoints failed",
          debug: debugInfo
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          msg: "Error: " + error.message 
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    // Health check
    if (url.pathname === "/health" || url.pathname === "/") {
      return new Response(JSON.stringify({ 
        status: "ok",
        message: "Blooket Bot Worker is running!",
        usage: "POST to /join with {id: gameCode, name: playerName}"
      }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
