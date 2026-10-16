import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  BookOpenText,
  Bot,
  Briefcase,
  ChartCandlestick,
  Crown,
  Eye,
  Lightbulb,
  ListOrdered,
  Newspaper,
  Wallet,
} from "lucide-react";
import { PowerCard } from "../components/PowerCards/card";
import type { PowerDescription } from "../types/types";
import { useHashScroll } from "../hooks/useHashScroll";

/** Display-only copies of built-in powers (see the server's src/powers/defs), so the page works without a server. */
const SAMPLE_POWERS: PowerDescription[] = [
  {
    rarity: 0.2,
    durationTicks: 15,
    iconSlug: "stop",
    title: "The Hacker: DDoS Attack",
    description: "Launch a DDoS attack on all traders, disabling their ability to trade for 15 seconds.",
    type: "others",
    isInstant: false,
    id: "the-hacker-ddos",
  },
  {
    rarity: 0.1,
    durationTicks: 30,
    iconSlug: "present",
    title: "Cash Heritage",
    description: "Instantly receive cash from your ancestors.",
    type: "client",
    isInstant: true,
    id: "cash-heritage",
  },
  {
    rarity: 0.2,
    durationTicks: 20,
    iconSlug: "volatility-storm",
    title: "Volatility Storm",
    description: "Increase market volatility for 20 seconds (everyone suffers).",
    type: "market",
    isInstant: false,
    id: "volatility-storm",
  },
];

const SECTIONS = [
  { id: "quick-start", label: "Quick start" },
  { id: "screen", label: "The trading screen" },
  { id: "orders", label: "Limit vs market" },
  { id: "powers", label: "Briefcases & powers" },
  { id: "price", label: "Why the price moves" },
  { id: "tips", label: "Tips" },
  { id: "hosting", label: "Hosting" },
];

const QUICK_START: { title: string; body: string }[] = [
  {
    title: "Open a room",
    body: "Pick a username and leave the room code empty to create a new room, or type a friend's code to join theirs. The first player in is the host.",
  },
  {
    title: "Invite people",
    body: "Share the room code or link. Friends can join from their phone or laptop; bots fill the market if you're on your own.",
  },
  {
    title: "Trade",
    body: "When the host starts the game, buy and sell the stock on a live order book against everyone else.",
  },
  {
    title: "Open briefcases",
    body: "Eight briefcases drop during the game. Each offers you three random powers: pick one, use it now or save it.",
  },
  {
    title: "Win on P&L",
    body: "When the clock runs out, players and bots are ranked by profit and loss. Highest P&L takes the tendies.",
  },
];

const SCREEN: { icon: ReactNode; title: string; body: ReactNode }[] = [
  {
    icon: <ChartCandlestick />,
    title: "Chart",
    body: "One candle is one game second. Scroll to zoom, drag to look back, and click anywhere on it to set a limit price there. Your resting orders show as tags on the chart; their × cancels them.",
  },
  {
    icon: <Wallet />,
    title: "Order form",
    body: "Pick Limit or Market, type a number of whole shares, then Buy or Sell. You can only sell shares you own, and buy what your cash covers.",
  },
  {
    icon: <ListOrdered />,
    title: "Order book",
    body: "Every resting order in the market: sellers' asks above, buyers' bids below. The gap between the best ask and the best bid is the spread.",
  },
  {
    icon: <Newspaper />,
    title: "News",
    body: "Headlines arrive every 30 to 45 seconds (if the host left news on). Some are noise. Some quietly change what the stock is really worth.",
  },
  {
    icon: <Briefcase />,
    title: "Briefcase",
    body: "Shimmers when a new offer is waiting. Your saved powers sit next to it as mini cards; click one to use it.",
  },
  {
    icon: <Crown />,
    title: "Top bar",
    body: "Your cash, shares and live P&L, marked to the current price. Cash and shares tied up in resting orders don't count as available.",
  },
];

const TIPS: string[] = [
  "Big market orders eat through the book and push the price against you. Split them up, or use limit orders.",
  "A limit order waiting in the book locks its cash or shares until it fills or you cancel it. Cancel stale orders to free them up.",
  "News that moves the fair value doesn't move the price right away. Bots that know the truth drift it there over the next seconds: get in before them.",
  "An Insider Tip shows you where the price is heading. It's the closest thing to a cheat code; use it before the market catches up.",
  "Save a DDoS for the final seconds: nobody else can trade while you lock in your position.",
  "Your P&L counts shares at the final price, so you don't have to sell before the bell. A late crash still hurts if you're holding.",
];

const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-4">
    <h2 id={`${id}-title`} className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
    {children}
  </section>
);

/** /how-to-play: the rules and the screen, for someone about to play their first game. */
export const HowToPlayPage = () => {
  useHashScroll();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-12">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold flex items-center gap-3"><BookOpenText size={36} /> How to play</h1>
        <p className="max-w-2xl">
          Everyone trades the same fictional stock for a few minutes. Briefcases hand out powers that bend the rules.
          Whoever finishes with the highest profit wins. Here's everything you need for your first game.
        </p>
        <nav aria-label="On this page" className="flex flex-wrap gap-2">
          {SECTIONS.map(({ id, label }) => (
            <Link key={id} to={`#${id}`} className="btn btn-sm btn-ghost bg-base-100">{label}</Link>
          ))}
        </nav>
      </header>

      <Section id="quick-start" title="Quick start">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_START.map((step, i) => (
            <li key={step.title} className="card card-border bg-base-100">
              <div className="card-body">
                <h3 className="card-title">
                  <span className="badge badge-primary">{i + 1}</span>
                  {step.title}
                </h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link to="/" className="btn btn-primary mt-4">Start a game</Link>
      </Section>

      <Section id="screen" title="The trading screen">
        <p className="max-w-3xl mb-4">
          The big chart on the left, the order form and the order book on the right, news and your order history under the chart.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCREEN.map(({ icon, title, body }) => (
            <div key={title} className="card bg-base-100">
              <div className="card-body">
                <h3 className="card-title">{icon} {title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="orders" title="Limit vs market orders">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card bg-base-100">
            <div className="card-body">
              <h3 className="card-title">Market order <span className="badge badge-soft">fast</span></h3>
              <p>
                Trades right now with the best orders already in the book. You always get filled, but you pay the
                spread, and a big order walks up (or down) the book to worse and worse prices.
              </p>
            </div>
          </div>
          <div className="card bg-base-100">
            <div className="card-body">
              <h3 className="card-title">Limit order <span className="badge badge-soft">patient</span></h3>
              <p>
                Names your price. If nobody matches it yet, it waits in the book until someone does, or until you
                cancel it. You never pay more (or sell for less) than your limit, but it might never fill.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 max-w-3xl opacity-80">
          Orders are only accepted while the game is running. The host can switch limit orders off, and then the form only offers Market.
        </p>
      </Section>

      <Section id="powers" title="Briefcases & powers">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="flex flex-col gap-4">
            <p>
              Eight times a game a briefcase drops for every player. It opens a hand of three random powers: pick one,
              or skip. Rare powers show up less often.
            </p>
            <ul className="flex flex-col gap-2">
              <li><span className="badge badge-warning">Instant</span> cards fire the moment you pick them.</li>
              <li>The rest go to your inventory, next to the briefcase, until you decide to use them.</li>
              <li>Powers with a duration count game seconds, so they freeze while the game is paused.</li>
            </ul>
            <p className="font-semibold">The card's color tells you who it hits:</p>
            <ul className="flex flex-col gap-2">
              <li className="flex items-center gap-2"><span className="size-4 rounded bg-linear-135 from-[#43e97b] to-[#38f9d7]" /> Green: helps you.</li>
              <li className="flex items-center gap-2"><span className="size-4 rounded bg-linear-135 from-[#4facfe] to-[#00f2fe]" /> Blue: hits everyone, you included.</li>
              <li className="flex items-center gap-2"><span className="size-4 rounded bg-linear-135 from-[#f093fb] to-[#f5576c]" /> Pink: moves the market or targets the other players.</li>
            </ul>
            <Link to="/powers" className="link">Browse every power in the library</Link>
          </div>
          <div className="relative h-80 sm:h-96 overflow-hidden" aria-hidden="true">
            <div className="hand-of-cards-background"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="hand-of-cards scale-50 sm:scale-65">
                {SAMPLE_POWERS.map((power) => <PowerCard key={power.id} power={power} />)}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="price" title="Why the price moves">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card bg-base-100">
            <div className="card-body">
              <h3 className="card-title"><Eye /> A hidden fair value</h3>
              <p>
                The stock has a real worth that nobody can see. It drifts slowly, and jumps on some news and powers.
                The traded price chases it, never quite catching up.
              </p>
            </div>
          </div>
          <div className="card bg-base-100">
            <div className="card-body">
              <h3 className="card-title"><Bot /> Bots</h3>
              <p>
                A market maker and liquidity bots keep quotes in the book. Momentum, mean-reversion and random traders
                add noise. Informed traders know the fair value and trade toward it.
              </p>
            </div>
          </div>
          <div className="card bg-base-100">
            <div className="card-body">
              <h3 className="card-title"><Wallet /> You</h3>
              <p>
                Every trade happens on the same order book. When players buy hard, the price goes up; when they dump,
                it goes down. Your own orders move the market.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 max-w-3xl opacity-80">
          Want to see it? The host's "reveal hidden prices" setting is a practice mode: the chart draws the fair value
          and the price it's being pulled toward.
        </p>
      </Section>

      <Section id="tips" title="Tips">
        <ul className="grid gap-3 md:grid-cols-2">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-3 items-start bg-base-100 rounded-box p-4">
              <Lightbulb className="shrink-0 text-warning" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="hosting" title="Hosting a game">
        <div className="max-w-3xl flex flex-col gap-3">
          <p>
            The first player in a room is the host. Before the game starts, the host picks the ticker, starting cash,
            game length, opening price, volatility, which bots join, and whether there's news or limit orders.
            Everyone else sees the settings update live while they wait.
          </p>
          <p>
            Once it's running, only the host can pause and resume. When the game ends, everyone sees the leaderboard,
            and the host can go back to setup for a rematch with the same settings.
          </p>
          <p>
            Got a TV? Cast the room from the top bar, or open the room's spectate page on a big screen, so the whole
            room can watch the chart and the news.
          </p>
        </div>
        <Link to="/" className="btn btn-primary mt-6">Start a game</Link>
      </Section>
    </main>
  );
};
