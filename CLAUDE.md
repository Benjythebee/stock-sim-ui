# stock-sim-ui ("Stonk Lords")

React front-end for a multiplayer stock-trading party game. Friends join a room by code and trade one fictional ticker against each other and AI bots on a real limit order book. The twist: every so often a **briefcase** offers each player 3 random **powers** (Mario Kart-style items: free cash, insider tips, rumors that move the price, a DDoS that blocks everyone else from trading, volatility storms). Whoever has the highest P&L when the clock runs out wins.

The server is `../stock-sim-server` (Bun, zero deps, own matching engine). **It is authoritative for everything**: prices, fills, cash, powers, timing. The UI is a thin view over its WebSocket stream. Read `../stock-sim-server/CLAUDE.md` before changing anything that touches gameplay or the protocol.

## Commands

```bash
pnpm install          # pnpm is the declared packageManager (bun.lock also exists; the server's launch.json runs `bun run --cwd ../stock-sim-ui dev`)
pnpm dev              # Vite on :5173
pnpm build            # tsc -b && vite build. Typecheck = `npx tsc -b`
pnpm lint             # eslint (currently 0 errors, a few warnings)
```

There are no tests in this repo. To see a change working, run the server too (`bun run dev` in `../stock-sim-server`, port 3000); its `.claude/launch.json` has `server` and `ui` preview configs. Open two browser tabs on the same room to play against yourself.

- Server URL: `VITE_SERVER_URL` (see `.env.example`). Default is the page's hostname on port 3000, so LAN friends hitting `http://<your-ip>:5173` reach your server. See `src/utils/server.ts`.
- `?debug` in the URL logs every inbound message (remembered in localStorage; `?debug=0` turns it off).

## How a game plays (the server's rules, as the UI shows them)

1. **Join** (`/`): username + room code → `connect()` → navigate to `/:roomId` once connected (a failed connect shows an error above the form; the username is prefilled from `localStorage.username`). The first player in a room is the **admin/host**.
2. **Lobby** (phase `lobby`, shown as "paused"): the host sees the Admin modal (General / Bots / Powers tabs). Every field change sends `ADMIN_SETTINGS` immediately and the server **rebuilds the game** (fresh accounts for everyone). Settings: ticker, starting cash, opening price, volatility %, duration (min), random news, "reveal hidden prices" (practice mode), bot count, and bot strategy selection (from `/api/bots.json`). Non-hosts see "Wait for your admin".
3. **Running**: "Save & Start" sends `TOGGLE_PAUSE`. The server ticks 5 market steps per **game second**. Each game second sends `CLOCK`, so **one candle = one game second**. Orders (limit or market, buy or sell, whole shares) are only accepted while running.
4. **Pause/resume**: only the host (nav dropdown or the Paused modal). Game time stops, so power durations, news and briefcases freeze too.
5. **Briefcases**: 8 drops spread over the game. Each player gets `POWER_OFFERS` (3 weighted-random powers). Instant powers fire on pick; others go to the inventory (shown as mini cards next to the briefcase) and are used later with `POWER_CONSUME`. Skipping discards the offer client-side.
6. **News**: random headlines every 30–45 game seconds (if enabled). Some silently move the hidden fair value.
7. **End**: `GAME_CONCLUSION` → leaderboard modal (players and bots ranked by P&L, total volume).

### The hidden price model (why players can win)

The server keeps a hidden **intrinsic value** (fair value; moves on news, powers and slow drift) and a **guide price** (a GBM that mean-reverts toward it). A house market maker and liquidity bots quote around the guide, so the traded price follows it. Informed bots trade toward the fair value. Human taker trades pull the guide price (market impact). The **mark price** (`STOCK_MOVEMENT`) is the last trade clamped inside the best bid/ask, and it's "the price" everywhere. The fair value is only revealed by the Insider Tip power or by the host's `revealPrices` practice toggle (then `DEBUG_PRICES` arrives and the chart draws two extra lines).

## Architecture

```
src/
  index.tsx / main.tsx   StrictMode root → WebSocketProvider → BrowserRouter → Layout → Routes
  layout.tsx             route-aware nav (HomeNavigation on /, /about; InGameNavigation in rooms; none on /cast), SiteFooter (not on /cast or spectate), Toaster, react-query client
  pages/                 Home (join), Room (player view), RoomSpectate, Whatisthis (/about marketing page; ends with #credits)
  cast.tsx               /cast: Chromecast receiver that iframes /:room/spectate
  context/
    ws.provider.tsx      the ONE WebSocket: connect/disconnect/sendMessage, ping every 3s, session resume
    ws.context.ts        context type + useWebsocketContext
    useAutoConnect.ts    connect on mount + reconnect with backoff (0, .5, 1, 2, 4, 8s cap)
    game.context.ts      useGameStore (zustand) + handleGameMessage(): the inbound message switch
    stock.store.ts       usePriceStore: price, candles (prices + timeLabels), asks/bids, clock, timeLeft
    debug.store.ts       hidden fair value / guide series for the practice-mode chart lines
    view.context.ts/.provider.tsx   legacy, unused since react-router
  types/messages.ts      MessageType enum + message types (HAND-COPIED from the server)
  types/types.ts         PowerDescription (= server's PublicPower)
  components/
    Trading/             Chart (candles + power UI), TradingCard (order form), TradingDepth (order book),
                         News, OrderHistory, MarketClose (open/closed badge + countdown), PowerButton (briefcase)
    PowerCards/          PowerCard (big collectible card), PowerMiniCard (inventory), HandOfCards (<dialog> fan of cards)
    Admin/               AdminModal (lobby settings / paused overlay) + tabs
    Conclusion/          end-of-game leaderboard
    nav/                 HomeNavigation, InGameNavigation (cash, shares, P/L, host menu, cast button)
    footer/              SiteFooter: Play, About, Credits (/about#credits), Discord, X
    Credits/             icon credits for /about: bundled icons (card.icons.ts) + mod icons from /api/powers.json (iconCredit)
    Toast/               zustand toast store + Toaster
    cast/button.tsx      Chromecast sender
  cards.css              all power-card styling (fan layout, per-type colors, animations)
  index.css              Tailwind 4 + DaisyUI (light default, dark preferred), wiggle/gradient keyframes, .btn-amber
public/powers/<icon>.svg bundled power icons (game-icons.net, CC BY 3.0; credits in PowerCards/card.icons.ts, shown on /about#credits). missing.svg is the load-failure placeholder (ours)
```

### Data flow

- **Inbound**: `ws.provider` parses JSON. It handles `PONG` (ping display) itself and stores the `ID` resume token in `sessionStorage.session_` before passing `ID` on (it resets `isAdmin`; `IS_ADMIN` follows for the host). Everything else goes to `handleGameMessage()` in `game.context.ts`, which writes to the zustand stores via `setState`/`getState()` (it's outside React). Notifications, `ERROR` messages and news also push toasts.
- **Outbound**: components call `sendMessage({ type: MessageType.X, ... })` from `useWebsocketContext()`. Nothing is optimistic except the pause flag and admin settings echo, and the server corrects both.
- **Stores** are read with selectors, usually `useShallow` for multi-field picks. Non-React code reads `useXStore.getState()`.
- **Candles**: `setClock` (on each `CLOCK`) appends a time label and opens a new candle at the last price. `setPrice` (on each `STOCK_MOVEMENT`) updates the high, low and close of the current candle. Before the game starts, `setClock` keeps a single candle. `debug.store` subscribes to the price store and appends a fair/guide sample per new candle.
- **Resets**: `resetRoomStores()` (game + price + debug stores; keeps the powers catalog) runs whenever you leave a room page. A `ROOM_STATE` with `started: false` (new room, lobby rebuilt by `ADMIN_SETTINGS`, server restart) clears candles, book, debug series, news, conclusion, offers and inventory, but keeps `isAdmin` and the catalog, which arrive just before it.
- **Powers catalog**: the server sends `CONTENT_MANIFEST` right after `ID` on every connect: all installed powers (built-ins + server mods) → `powers.data`, and every server-hosted asset is preloaded (`preloadImages`). `POWER_INVENTORY` carries only ids, resolved against that catalog in order (duplicates kept). `HandOfCards` still fetches `/api/powers.json` as a fallback if the catalog is empty.
- **Power icons**: `PowerIcon` (`components/PowerCards/power-icon.tsx`) uses `iconUrl` (a server-relative URL for icons shipped by a mod, prefixed with the server origin) or else `/powers/<iconSlug>.svg`, swaps to `/powers/missing.svg` on load error, and shows `iconCredit` as a tooltip. See `utils/powerIcon.ts`.

### Connection and reconnect

- URL: `ws(s)://<server>/ws/<roomId>?username=…[&spectator=true][&prevSessionData=<roomId>-<playerId>]`.
- The `ID` message's value is sent back as `prevSessionData` when reconnecting to the same room, so a refresh keeps the seat, cash, shares and powers (the server holds seats for 60s). Joining a different room clears it. It lives in `sessionStorage`, so each tab is its own player (in `localStorage`, two tabs shared a seat and the server silently detached the first). A duplicated tab copies sessionStorage, so it still shares the seat.
- **Leaving a room page** any way (Disconnect, browser Back, footer links) makes `Layout` call `disconnect(false)` + `resetRoomStores()`, so Home starts clean and the old room's toasts stop. It's in `Layout`, keyed on the room path, not in the room pages' unmount cleanup, because StrictMode's test unmount would close the socket Home just opened. The resume token is kept, so Back into the same room within 60s resumes the seat. `disconnect()` (default `stayDisconnected=true`) is the sticky version the Disconnect button uses while the room page is still mounted.
- `detach()` nulls the handlers before closing, so replacing or abandoning a socket never fires `onclose` and never triggers auto-reconnect. `disconnect()` sets `closedByUser` so `useAutoConnect` stays down. Keep both behaviours: the server deliberately does *not* close a superseded socket, because closing makes the UI reconnect in a loop (two tabs, or StrictMode double-mount).
- Socket callbacks use `useEffectEvent` + a `wsRef`, not state, because state went stale inside handlers and leaked sockets.
- Spectators (`/:roomId/spectate`, also the cast target) get room state, depth, prices and news, but no portfolio. The server rejects spectating a room that doesn't exist with an `ERROR` (toasted) then close code 4004, which stops auto-reconnect.

## Wire protocol (keep in sync with the server)

- JSON `{ type: MessageType, ...fields }` with a **numeric** `type`. Source of truth: `../stock-sim-server/src/protocol/messages.ts`. This repo's `src/types/messages.ts` is a hand-made mirror. **Never renumber**. Ranges: 0-29 core, 30-59 admin, 60-79 lifecycle, 80-89 powers, 99 debug. The server has an `/add-message-type` skill covering both repos.
- A new client→server message also needs a case in the server's `protocol/parse.ts`, or it's silently dropped. A new server→client message needs a case in `handleGameMessage`.
- Semantics to respect:
  - Money is dollars on the wire (the server uses integer cents internally). Quantities are whole shares (the server floors them).
  - `ROOM_STATE` makes the UI reset cash to `startingCash`. The server always follows it with the real `PORTFOLIO_UPDATE`. Don't reorder that handling.
  - `PORTFOLIO_UPDATE.value`: `cash`/`shares` are **available** (excluding what's locked in resting orders), plus `reservedCash`, `reservedShares`, and the server-computed `pnl`.
  - `ORDER_BOOK_UPDATE.depth` = `[asks, bids]`, each `[price, qty][]`, up to 25 levels per side.
  - `TOGGLE_PAUSE` server→client carries the absolute `paused`. Set it, don't toggle it.
  - `marketVolatility`: the server stores and sends a **fraction** (0.05). `ADMIN_SETTINGS` expects a **percentage** (5). The admin input shows `×100` and sends the raw percentage.
  - `CLOCK.value` is the game clock in epoch ms (+1000 per game second, frozen while paused). `timeLeft` is ms.
  - `CLIENT_STATE.tradingDisabled` (e.g. while DDoSed) disables the Buy/Sell buttons.
  - Errors and order rejections arrive as `NOTIFICATION` toasts (`ERROR` is only used for "Room does not exist"). The server sends no per-order ack or fill events.
  - Host-only messages (`TOGGLE_PAUSE`, `ADMIN_SETTINGS`, `SHOCK`) from non-hosts get a "Host only" toast.
- HTTP: `/api/powers.json` (`PowerDescription[]`), `/api/bots.json` (`{ data: [{id, name, description}] }`), via `apiUrl()`.

## UI conventions and design choices

- **Stack**: React 19, TypeScript (strict, `verbatimModuleSyntax` → `import type`), Vite 7, Tailwind 4 + **DaisyUI 5** (use DaisyUI component classes: `card`, `btn`, `badge`, `table`, `modal`, `toggle`, `navbar`, `alert`/`toast`), zustand 5, react-router 7, react-query (only for `/api/bots.json`), Chart.js + `chartjs-chart-financial` (candlesticks, Luxon time adapter), lucide-react icons.
- `cn()` in `utils/cn.ts` wraps `classnames`. Multi-slot variants use `css-variants` `scv` (see `components/Card`).
- Style: 2-space indent, single quotes in most files (not enforced; match the file you're in). PascalCase component folders with `index.tsx`, or `name.role.tsx` files (`home.join.tsx`, `in-game.nav.tsx`, `card.mini.tsx`).
- **Layout**: the room page puts a big candlestick chart on the left with News and Order History under it, and a fixed 320px right sidebar holding the order form above the order book. It stacks on mobile (`lg:` breakpoint).
- Overlays (admin settings, paused, game over) are centered DaisyUI `card`s at `z-50` over a dimmed backdrop. They are not `<dialog>`s, and they block trading while paused or ended.
- **Powers are presented as collectible cards.** The card color comes from the power's `type` (`client` = self, `all`, `market`; `others` currently falls back to the market style). Instant powers get a banner. Offers fan out as a hand in a full-screen `<dialog id="hand-cards-modal">` rendered through `Portal`. The briefcase button is `.btn-amber`: it shimmers (`data-active`) and the open-briefcase image wiggles when an offer is waiting. Up to 5 inventory mini cards sit next to it, and clicking one asks for confirmation before consuming it.
- Feedback is toast-driven: server notifications, joins and news all appear bottom-right for about 5s.
- Theme switching uses `theme-change` (DaisyUI light/dark).
- Branding: "Stonk Lords" (`/stonk-lord_alpha.webp` logo), Discord and X links. Chromecast receiver app id `6030BF63`, namespace `urn:x-cast:com.stonklords.room`.

## Adding things

- **A new power** is a server mod (`../stock-sim-server/mods/powers/<id>/`, see its `mods/README.md`). It can ship its own icon (served by the server) with an `iconCredit`. The UI needs no change: the manifest, the icon and the Credits section all pick it up. Only a new *bundled* icon name needs `public/powers/<icon>.svg` plus a credit entry in `components/PowerCards/card.icons.ts`.
- **A new setting**: add it to the server's `GameSettings` and `applySettingsUpdate` sanitizer, then to this repo's `GameSettings` type and an input in `components/Admin/*-settings.tsx` that calls `setGameSettings({...})`.
- **A new message**: see "Wire protocol" above. Change both repos in the same change.

## Known gaps / gotchas (verify before relying on them)

- **P/L in the nav is computed client-side** as `cash + shares × price − startingCash` using the *available* cash and shares, so it dips while you have resting orders and ignores the server's `pnl`. The leaderboard uses the server's `pnl`.
- `OrderHistory` shows **hard-coded mock data**. The server sends no order or fill events yet. The Admin "Powers" tab is a placeholder.
- The "Send Value shock" / "Send shock" buttons in `TradingCard` show for every player, but only the host may use them (debug tools).
- The Join card says "Leave empty for a new room", but an empty code builds `/ws/`, which the server 404s (room ids must match `^[A-Za-z0-9_-]{1,64}$`).
- `Layout` sits outside `<Routes>`, so `useParams()` is empty there: it decides home vs room from `useLocation().pathname` (`STATIC_PAGES`). Add new top-level pages to that set, or they'll be treated as room codes.
- `TradingDepth` sorts the store's arrays in place. Market orders send a dummy `price: 100`, which the server ignores.
- The local `GameSettings` defaults (cash 5000, volatility 5, 1 bot) differ from the server's (10,000 / 0.05 / 5). They're overwritten by `ROOM_STATE` on join.
- Rooms live in server memory only, so a server restart drops games. The UI auto-reconnects into a fresh empty room.
