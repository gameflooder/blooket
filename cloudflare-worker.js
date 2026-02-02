// CLOUDFLARE WORKER PROXY - DIRECT BLOOKET METHOD
// Deploy this to Cloudflare Workers (free):
// 1. Go to https://workers.cloudflare.com/
// 2. Sign up / Log in
// 3. Create a new Worker
// 4. Paste this code
// 5. Deploy and get your worker URL (e.g., https://your-worker.your-name.workers.dev)
// 6. Update script.js with your worker URL

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only handle POST to /join
    const url = new URL(request.url);
    
    if (url.pathname === "/join" && request.method === "POST") {
      try {
        const body = await request.json();
        
        // Use Blooket's OFFICIAL Firebase join endpoint directly
        // This bypasses any third-party detection
        const response = await fetch("https://fb.blooket.com/c/firebase/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Origin": "https://play.blooket.com",
            "Referer": "https://play.blooket.com/",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          msg: "Proxy error: " + error.message 
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
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Blooket Proxy - POST to /join", { status: 200 });
  },
};
