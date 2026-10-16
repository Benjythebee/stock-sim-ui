import { defineConfig } from "cf/config";

// The UI is an assets-only Worker (no server code): `vite build` output served from Cloudflare's edge.
// The game server is separate: a DigitalOcean droplet behind a Cloudflare Tunnel at api.tendiesbrawl.com
// (see .env.production and ../stock-sim-server/deploy/README.md).
export default defineConfig({
  worker: {
    "name": "tendiesbrawl",
    "compatibilityDate": "2026-10-06",
    "observability": {
      "enabled": true
    },
    "assets": {
      // Room pages (/:roomId, /:roomId/spectate) are client-side routes.
      "notFoundHandling": "single-page-application"
    },
    // www is redirected to the apex by a zone redirect rule, so the server's CORS origin stays a single value.
    "domains": ["tendiesbrawl.com", "www.tendiesbrawl.com"],
    "workersDev": false
  }
});
