# stock-sim-ui ("Tendies Brawl")

React front-end for a multiplayer stock-trading party game. Friends join a room by code and trade one fictional ticker against each other and AI bots on a real limit order book. The twist: every so often a **briefcase** offers each player 3 random **powers** (Mario Kart-style items: free cash, insider tips, rumors that move the price, a DDoS that blocks everyone else from trading, volatility storms). Whoever has the highest P&L when the clock runs out wins.

The server is `../stock-sim-server` (Bun, zero deps, own matching engine). **It is authoritative for everything**: prices, fills, cash, powers, timing. The UI is a thin view over its WebSocket stream. Read `../stock-sim-server/CLAUDE.md` before changing anything that touches gameplay or the protocol.

## Commands

```bash
pnpm install          # pnpm is the declared packageManager (bun.lock also exists; the server's launch.json runs `bun run --cwd ../stock-sim-ui dev`)
pnpm dev              # Vite on :5173
pnpm build            # tsc -b && vite build. Typecheck = `npx tsc -b`
pnpm lint             # eslint (currently 0 errors, a few warnings)
pnpm run deploy       # tsc -b && cf deploy: builds with .env.production and ships to tendiesbrawl.com (needs `cf auth login`)
```

**Production**: the UI is an assets-only Cloudflare Worker `tendiesbrawl` (`cloudflare.config.ts`: custom domains for the apex and www, SPA fallback so `/:roomId` routes work). A zone redirect rule sends www → apex. `.env.production` points the build at `https://api.tendiesbrawl.com`, the game server (see `../stock-sim-server/deploy/README.md`). `cf deploy` runs `vite build` itself, not the `build` script, which is why `deploy` runs `tsc -b` first. It builds from the working tree, so commit (or stash) unrelated edits first. The Cloudflare Vite plugin in `vite.config.ts` came from `cf init`; `pnpm dev` still serves the app on :5173.

There are no tests in this repo. To see a change working, run the server too (`bun run dev` in `../stock-sim-server`, port 3000); its `.claude/launch.json` has `server` and `ui` preview configs. Open two browser tabs on the same room to play against yourself.

- Server URL: `VITE_SERVER_URL` (see `.env.example`). Default is the page's hostname on port 3000, so LAN friends hitting `http://<your-ip>:5173` reach your server. See `src/utils/server.ts`.
- `?debug` in the URL logs every inbound message (remembered in localStorage; `?debug=0` turns it off).

## How a game plays (the server's rules, as the UI shows them)

1. **Join** (`/`): username + room code (empty = a random 5-char code) → `connect()` → navigate to `/:roomId` once connected (a failed connect shows an error above the form; the username is prefilled from `localStorage.username`). Opening `/:roomId` directly (an invite link) with no saved `localStorage.username` shows a name prompt (`Room/room.name-prompt.tsx`) before connecting; with one saved, it joins straight away. The first player in a room is the **admin/host**.
2. **Lobby** (phase `lobby`, shown as "paused"): the host sees the wide "Game setup" modal while `!started`: a section menu (General / Gameplay / Market / Bots / Powers / Cast to TV, defined in `Admin/tabs.tsx`), the section's settings, and an **Invite players** panel (`Admin/invite-panel.tsx`: room code, how to join, copyable `/:roomId` link, a warning when served from localhost). Text and number fields keep a local draft and send `ADMIN_SETTINGS` on blur or Enter (`Admin/setting-input.tsx`; Escape or an invalid value reverts); toggles and bot checkboxes send immediately. Every `ADMIN_SETTINGS` makes the server **rebuild the game** (fresh accounts for everyone) and echo `ROOM_STATE`. Settings: General = ticker, starting cash, duration (min), "reveal hidden prices" (practice mode); Gameplay = disable limit orders (the order form then only offers Market), random news; Market = opening price, volatility %, disable random walk; Bots = bot count and bot strategy selection (from `/api/bots.json`; an empty `botSelection` means every strategy, which is what the "Random Bots" toggle shows). Powers = "Enable powers" (`enablePowers`; off = no briefcases, and the room hides the briefcase button) and one toggle per offerable power with its icon, rarity and description (`Admin/power-settings.tsx`). The server stores the powers that are **off** (`disabledPowers`), so a power a mod adds later starts on; switching every power off means no briefcase drops either. Everyone else (players, spectators, the TV) sees "Waiting for the host": the settings read-only and live (`Admin/settings-summary.tsx`; a changed value flashes, and it waits for `hasRoomState` so local defaults never show) next to the same invite panel. Both lobby headers show the player's name with a pencil (`Admin/player-name.tsx`): renaming sends `RENAME` and saves it to `localStorage.username`. Next to it, the "N connected" badge (`Admin/player-list.tsx`) opens a list of the room's players from `PLAYERS` (host crown, "you", reconnecting), and is a plain count when no list has arrived (an older server).
3. **Running**: "Start game" sends `TOGGLE_PAUSE`. The server ticks 5 market steps per **game second**. Each game second sends `CLOCK`, so **one candle = one game second**. Orders (limit or market, buy or sell, whole shares) are only accepted while running.
4. **Pause/resume**: only the host (nav dropdown or the Paused modal, which shows "Resume" once the game has started; settings are locked then). Game time stops, so power durations, news and briefcases freeze too.
5. **Briefcases**: 8 drops spread over the game. Each player gets `POWER_OFFERS` (3 weighted-random powers). Instant powers fire on pick; others go to the inventory (shown as mini cards next to the briefcase) and are used later with `POWER_CONSUME`. Skipping sends `POWER_SELECT` with `index: -1` (`POWER_SKIP_INDEX`) so the server drops the offers too; otherwise they'd come back on reconnect. Esc only hides the hand, and the briefcase reopens it.
6. **News**: random headlines every 30–45 game seconds (if enabled). Some silently move the hidden fair value.
7. **End**: `GAME_CONCLUSION` → leaderboard modal (players and bots ranked by P&L, total volume), also on the spectate page. The server re-sends it to anyone who (re)joins or spectates an ended game. An ended room reports `paused: true`, so `AdminModal` hides itself when `ended`. The host's "Go back to setup" button sends `RESET_GAME`: the server returns the room to the lobby with the same settings (new seed) and the usual `ROOM_STATE started: false` resets the UI.

### The hidden price model (why players can win)

The server keeps a hidden **intrinsic value** (fair value; moves on news, powers and slow drift) and a **guide price** (a GBM that mean-reverts toward it). A house market maker and liquidity bots quote around the guide, so the traded price follows it. Informed bots trade toward the fair value. Human taker trades pull the guide price (market impact). The **mark price** (`STOCK_MOVEMENT`) is the last trade clamped inside the best bid/ask, and it's "the price" everywhere. The fair value is only revealed by the Insider Tip power or by the host's `revealPrices` practice toggle (then `DEBUG_PRICES` arrives and the chart draws two extra lines).

## Architecture

```
src/
  index.tsx / main.tsx   StrictMode root → WebSocketProvider → BrowserRouter → Layout → Routes
  layout.tsx             route-aware nav (HomeNavigation on /, /about, /how-to-play, /powers; InGameNavigation in rooms; none on /cast), SiteFooter (not on /cast or spectate), PresentationOverlay, Toaster, react-query client
  pages/                 Home (join), Room (player view), RoomSpectate, Whatisthis (/about: short hero, features, FAQ, socials, #credits), HowToPlay (/how-to-play: rules, the screen, orders, powers, tips, hosting), Powers (/powers library)
  cast.tsx               /cast: Chromecast receiver that iframes /:room/spectate
  context/
    ws.provider.tsx      the ONE WebSocket: connect/disconnect/sendMessage, ping every 3s, session resume
    ws.context.ts        context type + useWebsocketContext
    useAutoConnect.ts    connect on mount + reconnect with backoff (0, .5, 1, 2, 4, 8s cap)
    game.context.ts      useGameStore (zustand) + handleGameMessage(): the inbound message switch
    stock.store.ts       usePriceStore: price, candles (prices + timeLabels), asks/bids, clock, timeLeft
    debug.store.ts       hidden fair value / guide series for the practice-mode chart lines
    order-form.store.ts  the order form's type + limit price draft (clicking the chart picks a limit price)
    view.context.ts/.provider.tsx   legacy, unused since react-router
  types/messages.ts      MessageType enum + message types (HAND-COPIED from the server)
  types/types.ts         PowerDescription (= server's PublicPower)
  hooks/                 useGameActions (every outbound message: togglePause, placeOrder, cancelOrder, selectPower,
                         consumePower, updateSettings, ...), useGameSettings, useMarketOpen/useCanTrade, useRoomConnection,
                         useLivePnl, useCopyToClipboard, useBotsCatalog/usePowersCatalog (react-query)
  utils/                 cn, math (money, round, parseNumber), time (formatTime, formatCountdown), fetch (fetchJson),
                         powerIcon (icon src, powerColor, PowerCardData), server (apiUrl), seo, debug
  components/
    ui/                  generic DaisyUI pieces, no game knowledge: OverlayShell (bare centered card) / OverlayCard + Backdrop, Panel (base-200 card + title),
                         Field (label + input), Toggle, HelpButton/HelpTooltip ("?" explanations), Tabs, Collapse,
                         ExternalLink, TableEmptyRow, Pnl (signed, colored $), Portal, Card
    Room/                RoomOverlays: backdrop + AdminModal + ConclusionModal, shared by Room and RoomSpectate
    Trading/             Chart (candles + power UI; chart.controls, useChartGestures), TradingCard (order form), TradingDepth (order book),
                         Portfolio (P/L, cash, shares, amounts in orders; top of the sidebar, above the chart on phones), News, CurrentOrders, OrderHistory, SideBadge, MarketClose (open/closed badge + countdown), PowerButton (briefcase)
    PowerCards/          PowerCard (big collectible card), PowerMiniCard (inventory), HandOfCards (<dialog> fan of cards)
    PowerLibrary/        PowerLibrary (searchable catalog: name, rarity tier, description, target, duration) + PowerLibraryButton (book icon → <dialog>).
                         On /powers, and in rooms from the nav, the lobby header and the Paused card (the overlays' backdrop covers the nav).
                         Rarity tiers come from the briefcase weight (`utils/rarity.ts`); in a room it lists the CONTENT_MANIFEST, else /api/powers.json (`useInstalledPowers`)
    Admin/               AdminModal (lobby "Game setup" / paused overlay) + one file per section; InvitePanel; SettingInput, NumberSetting, SettingToggle
    Conclusion/          end-of-game leaderboard
    nav/                 NavBrand (logo + theme), HomeNavigation, InGameNavigation (room code that copies the invite link, game status badge, player list; labeled Powers, Cast, host Pause, name, Leave buttons, icon-only below md)
    footer/              SiteFooter: Play, About, Credits (/about#credits), Discord, X, plus app/server/mods API versions
    Credits/             icon credits for /about: bundled icons (card.icons.ts) + mod icons from /api/powers.json (iconCredit)
    Toast/               zustand toast store + Toaster
    Presentation/        power animations (POWER_PRESENT): queue store, PresentationOverlay, PrizeWheel
    cast/button.tsx      Chromecast sender
  cards.css              all power-card styling (fan layout, per-type colors, animations)
  index.css              Tailwind 4 + DaisyUI (light default, dark preferred), wiggle/gradient keyframes, .btn-amber
public/powers/<icon>.svg bundled power icons (game-icons.net, CC BY 3.0; credits in PowerCards/card.icons.ts, shown on /about#credits). missing.svg is the load-failure placeholder (ours)
```

### Data flow

- **Inbound**: `ws.provider` parses JSON. It handles `PONG` (ping display) itself and stores the `ID` resume token in `sessionStorage.session_` before passing `ID` on (it resets `isAdmin`; `IS_ADMIN` follows for the host). Everything else goes to `handleGameMessage()` in `game.context.ts`, which writes to the zustand stores via `setState`/`getState()` (it's outside React). Notifications, `ERROR` messages and news also push toasts.
- **Outbound**: components call the helpers from `useGameActions()` (`hooks/useGameActions.ts`), which build the messages and call `sendMessage`. Add new outbound messages there rather than calling `sendMessage` from components. Nothing is optimistic except the pause flag and admin settings echo, and the server corrects both.
- **Stores** are read with selectors, usually `useShallow` for multi-field picks. Non-React code reads `useXStore.getState()`.
- **Candles**: `setClock` (on each `CLOCK`) appends a time label and opens a new candle at the last price. `setPrice` (on each `STOCK_MOVEMENT`) updates the high, low and close of the current candle. Before the game starts, `setClock` keeps a single candle. `debug.store` subscribes to the price store and appends a fair/guide sample per new candle.
- **Resets**: `resetRoomStores()` (game + price + debug stores; keeps the powers catalog) runs whenever you leave a room page. A `ROOM_STATE` with `started: false` (new room, lobby rebuilt by `ADMIN_SETTINGS`, server restart) clears candles, book, debug series, news, conclusion, offers and inventory, but keeps `isAdmin` and the catalog, which arrive just before it.
- **Powers catalog**: the server sends `CONTENT_MANIFEST` right after `ID` on every connect: all installed powers (built-ins + server mods) → `powers.data`, and every server-hosted asset is preloaded (`preloadImages`). `POWER_INVENTORY` carries only ids, resolved against that catalog in order (duplicates kept). `HandOfCards` still fetches `/api/powers.json` as a fallback if the catalog is empty.
- **Power icons**: `PowerIcon` (`components/PowerCards/power-icon.tsx`) uses `iconUrl` (a server-relative URL for icons shipped by a mod, prefixed with the server origin) or else `/powers/<iconSlug>.svg`, swaps to `/powers/missing.svg` on load error, and shows `iconCredit` as a tooltip. See `utils/powerIcon.ts`.

### Connection and reconnect

- URL: `ws(s)://<server>/ws/<roomId>?username=…[&spectator=true][&prevSessionData=<roomId>-<resumeToken>]`.
- The `ID` message's value (`<roomId>-<resumeToken>`: a random secret for our seat, separate from the player id and never broadcast) is sent back as `prevSessionData` when reconnecting to the same room, so a refresh keeps the seat, cash, shares and powers (the server holds seats for 60s). Joining a different room clears it. It lives in `sessionStorage`, so each tab is its own player (in `localStorage`, two tabs shared a seat and the server silently detached the first). A duplicated tab copies sessionStorage, so it still shares the seat.
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
  - `marketVolatility`: the server stores and sends a **fraction** (0.05). `ADMIN_SETTINGS` expects a **percentage** (5). The store holds the fraction too; the admin input shows it `×100` (rounded) and sends the typed percentage, and `AdminModal`'s optimistic save divides it back.
  - `CLOCK.value` is the game clock in epoch ms (+1000 per game second, frozen while paused). `timeLeft` is ms.
  - `CLIENT_STATE.tradingDisabled` (e.g. while DDoSed) disables the Buy/Sell buttons.
  - `RENAME` (21, client→server) `{ username }` changes a player's display name in any phase. The server cleans it (control characters, 32 chars) and broadcasts nothing. A reconnect also renames, since the resume sends `username` again.
  - `PLAYERS` (22, server→client) `{ players: [{ name, connected, host }], you }` is the whole human player list, re-sent on every join, disconnect, removal and rename. `you` is our index (-1 for spectators). It has no ids on purpose (nor do `JOIN`/`LEAVE`, which only carry `roomId` and, for `JOIN`, `username`).
  - `POWER_SELECT.index` is an offer index, or `-1` (`POWER_SKIP_INDEX`) to decline the briefcase.
  - `POWER_PRESENT` (84, private) asks for a power animation, e.g. `{ kind: "wheel", segments, result, durationMs }`. The server has already decided the outcome and reports it with a normal `NOTIFICATION` once the animation is over, so `usePresentations` drops kinds it doesn't know (`SUPPORTED_PRESENTATIONS`) and the toast still tells the player what happened. Animations play one at a time in `PresentationOverlay`, and Skip/Close never hides anything.
  - Errors and order rejections arrive as `NOTIFICATION` toasts (`ERROR` is only used for "Room does not exist"). The server sends no per-order ack or fill events.
  - Host-only messages (`TOGGLE_PAUSE`, `ADMIN_SETTINGS`, `SHOCK`) from non-hosts get a "Host only" toast.
- HTTP: `/api/powers.json` (`PowerDescription[]`), `/api/bots.json` (`{ data: [{id, name, description}] }`), `/api/version.json` (`{ version, revision, modApi }`), via `apiUrl()`.

### Versions

- The footer shows the app version (`package.json`) and the commit it was built from (both injected by `vite.config.ts` as `__APP_VERSION__` / `__APP_REVISION__`, see `utils/version.ts`), the server's version and commit (`/api/version.json`), and the **mods API** version this app supports (`SUPPORTED_MOD_API`).
- The mods API version (`MOD_API_VERSION` in the server's `src/version.ts`) counts what mods can use, including what the UI must render. When a new presentation kind (or anything else mods rely on) lands, bump it on the server **and** bump `SUPPORTED_MOD_API` here with the new component. The footer warns when the server's is newer than this build's.

## UI conventions and design choices

- **Stack**: React 19, TypeScript (strict, `verbatimModuleSyntax` → `import type`), Vite 7, Tailwind 4 + **DaisyUI 5** (use DaisyUI component classes: `card`, `btn`, `badge`, `table`, `modal`, `toggle`, `navbar`, `alert`/`toast`), zustand 5, react-router 7, react-query (only for `/api/bots.json`), Chart.js + `chartjs-chart-financial` (candlesticks, Luxon time adapter), lucide-react icons.
- `cn()` in `utils/cn.ts` wraps `classnames`. Multi-slot variants use `css-variants` `scv` (see `components/Card`).
- Style: 2-space indent, single quotes in most files (not enforced; match the file you're in). PascalCase component folders with `index.tsx`, or `name.role.tsx` files (`home.join.tsx`, `in-game.nav.tsx`, `card.mini.tsx`).
- **Layout**: the room page puts a big candlestick chart on the left with News and Order History under it, and a fixed 320px right sidebar holding the order form above the order book. It stacks on mobile (`lg:` breakpoint).
- Overlays (admin settings, paused, game over) are centered DaisyUI `card`s at `z-50` over a dimmed backdrop. They are not `<dialog>`s, and they block trading while paused or ended.
- **Powers are presented as collectible cards.** The card color comes from the power's `type` (`client` = self, `all`, `market`; `others` currently falls back to the market style). Instant powers get a banner. Offers fan out as a hand in a full-screen `<dialog>` rendered through `Portal`. Each `HandOfCards` owns its dialog (a ref driven by its `open` prop, no global id: the offers hand and the consume hand can both be mounted) and calls `onDismiss` on the dialog's `cancel`/`close` events (Esc), so the owner's state stays in sync. The briefcase button is `.btn-amber`: it shimmers (`data-active`) and the open-briefcase image wiggles when an offer is waiting. Up to 5 inventory mini cards sit next to it, and clicking one asks for confirmation before consuming it.
- Feedback is toast-driven: server notifications, joins and news all appear bottom-right for about 5s.
- Theme switching uses `theme-change` (DaisyUI light/dark).
- Branding: "Tendies Brawl" (tendiesbrawl.com; `/tendies-brawl.webp` full logo on Home, `/tendies-brawl-icon.webp` square icon in the navs, `favicon.png` + `apple-touch-icon.png` from the icon), Discord and X links. Chromecast receiver app id `6030BF63`, namespace `urn:x-cast:com.tendiesbrawl.room`.

## Adding things

- **A new power** is a server mod (`../stock-sim-server/mods/powers/<id>/`, see its `mods/README.md`). It can ship its own icon (served by the server) with an `iconCredit`. The UI needs no change: the manifest, the icon and the Credits section all pick it up. Only a new *bundled* icon name needs `public/powers/<icon>.svg` plus a credit entry in `components/PowerCards/card.icons.ts`.
- **A new power animation** (a "presentation" kind, like the prize wheel): a component in `components/Presentation/`, a case in `PresentationOverlay`, its type in `types/messages.ts` (`Presentation`), and the kind in `SUPPORTED_PRESENTATIONS`. On the server: the type and validation in `src/powers/presentation.ts`. Bump the mods API version on both sides.
- **A new setting**: add it to the server's `GameSettings` and `applySettingsUpdate` sanitizer, then to this repo's `GameSettings` type and an input in `components/Admin/*-settings.tsx`: a `NumberSetting`, `SettingInput` or `SettingToggle` wired to `const [gameSettings, setGameSettings] = useGameSettings()`.
- **UI pieces**: before writing DaisyUI markup by hand, check `components/ui/` (cards, fields, toggles, tooltips, tabs, links). Store checks that more than one component needs belong in `hooks/`.
- **A new message**: see "Wire protocol" above. Change both repos in the same change.

## Known gaps / gotchas (verify before relying on them)

- **P/L** (the Portfolio panel) is the server's `pnl` from the last `PORTFOLIO_UPDATE`, marked to the live price: `pnl + (shares + reservedShares) × (price − pnlMark)`. The server only re-sends the portfolio when the account changes, and players start with 0 shares, so that is exact until the next update.
- The UI no longer sends `SHOCK` (the host-only debug buttons were removed). The message type stays in `messages.ts` to mirror the server.
- An empty room code on the Join card makes up a 5-character code (room ids must match `^[A-Za-z0-9_-]{1,64}$`; the server 404s `/ws/`).
- `Layout` sits outside `<Routes>`, so `useParams()` is empty there: it decides home vs room from `useLocation().pathname` (`STATIC_PAGES`). Add new top-level pages to that set, or they'll be treated as room codes.
- Market orders send a dummy `price: 100`, which the server ignores. Store arrays are shared state: copy before sorting (`[...asks].sort(...)`).
- The local `GameSettings` defaults (cash 5000, 1 bot) differ from the server's (10,000 / 5). They're overwritten by `ROOM_STATE` on join.
- **Cast TVs are detected** by `IS_CAST_DEVICE` (`utils/screen.ts`): the receiver iframes `/:room/spectate?tv`, and Cast user agents contain `CrKey`. On a TV the nav hides the cast and power-library buttons, and the lobby shows `Admin/tv-waiting.tsx` (join code, up to 12 player tags then "and N more", a settings line) instead of the wide waiting card. Add `?tv` to a spectate URL to preview it in a browser.
- **Old Chromium on Cast devices** (a TV reported Chrome 92). Tailwind 4 and DaisyUI 5 target Chrome 111+, so `postcss.config.js` flattens `@layer`, adds `rgb()` fallbacks for `oklch()`, and copies `translate` into `transform`, in **builds only** (it mangles the nested CSS that dev serves). Check the TV look with a build, not `pnpm dev`. `:has()` and DaisyUI's `color-mix()` with variables still don't work there. The `/cast` receiver uses inline styles for the same reason.
- Rooms live in server memory only, so a server restart drops games. The UI auto-reconnects into a fresh empty room.
