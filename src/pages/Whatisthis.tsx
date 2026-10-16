import type { ReactNode } from "react";
import { Discord, XLight } from "@ridemountainpig/svgl-react";
import { Bot, Briefcase, ListOrdered, Tv } from "lucide-react";
import CandlestickChart from "../components/Candles/candles";
import { Card } from "../components/ui/card";
import { Collapse } from "../components/ui/collapse";
import { ExternalLink } from "../components/ui/external-link";
import { Credits } from "../components/Credits";
import { Link } from "react-router";
import { DISCORD_URL, X_URL } from "../components/footer";
import { useHashScroll } from "../hooks/useHashScroll";

const FEATURES: { icon: ReactNode; title: string; body: ReactNode }[] = [
  {
    icon: <ListOrdered />,
    title: "A real order book",
    body: "No fake price feed: every buy and sell matches on a live limit order book, and your trades move the price.",
  },
  {
    icon: <Briefcase />,
    title: "Random power-ups",
    body: (
      <>
        Like items in a kart racer: free cash, insider tips, rumors, volatility storms, or a DDoS so nobody can trade
        but you. <Link to="/powers" className="link">See every power</Link>
      </>
    ),
  },
  {
    icon: <Bot />,
    title: "Bots with a plan",
    body: "Market makers, momentum chasers and informed traders who know what the stock is really worth. Play solo or fill a room.",
  },
  {
    icon: <Tv />,
    title: "Made for game night",
    body: "Share a room code, play from phones and laptops, and cast the live chart to the TV.",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is Tendies Brawl free?",
    a: "Yes. It runs in your browser with no download or sign-up. Pick a username and play.",
  },
  {
    q: "Is it real money or real stocks?",
    a: "No. The stock is fictional and so is the cash. It's a trading simulator and party game, not investing.",
  },
  {
    q: "Can I play alone?",
    a: "Yes. Create a room and add AI bots: market makers, momentum traders and informed traders who know where the fair value is.",
  },
  {
    q: "How do I play with friends?",
    a: "Create a room and share its code or URL. Everyone who opens it joins the same market. You can also cast the spectator view to a TV.",
  },
  {
    q: "How long is a game?",
    a: "The host picks the length. A few minutes is plenty: briefcases and news are spread over the whole game, so short games stay busy.",
  },
  {
    q: "How does the price move?",
    a: "Every trade happens on a real order book. A hidden fair value moves on news and power-ups, bots trade around it, and big trades from players push the price.",
  },
];

/** /about: what Tendies Brawl is, FAQ, socials and credits. The rules live on /how-to-play. */
export const WhatIsThisPage: React.FC = () => {
  useHashScroll();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-12">
      <section className="relative overflow-hidden rounded-box bg-base-100 px-6 py-10 md:px-12 md:py-14">
        {/* Decorative chart, dimmed behind the text */}
        <div className="absolute inset-y-0 right-0 hidden sm:flex items-center opacity-20 pointer-events-none" aria-hidden="true">
          <CandlestickChart />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold">Multiplayer stock trading game with a twist.</h1>
          <p className="py-4">
            Tendies Brawl is a free browser party game. Trade a virtual stock against your friends and AI bots on a
            live order book, use random power-ups to swing the market, and finish with the best P&amp;L to win the
            brawl.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/" className="btn btn-primary">Play for free</Link>
            <Link to="/how-to-play" className="btn btn-ghost">How to play</Link>
          </div>
        </div>
      </section>

      <section aria-label="Features" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon, title, body }) => (
          <div key={title} className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title">{icon} {title}</h2>
              <p>{body}</p>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="faq">
        <h2 id="faq" className="text-3xl font-bold mb-4">FAQ</h2>
        <div className="flex flex-col gap-2">
          {FAQ.map(({ q, a }) => (
            <Collapse key={q} title={q} className="bg-base-100"><p>{a}</p></Collapse>
          ))}
        </div>
      </section>

      <Card
        className="border-0"
        size="full"
        title="Socials"
        content={
          <div className="flex justify-end">
            <ul className="menu menu-vertical lg:menu-horizontal">
              <li>
                <ExternalLink href={DISCORD_URL}>
                  Discord <Discord width={"4rem"} />
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href={X_URL}>
                  Twitter / X <XLight width={"3.2rem"} />
                </ExternalLink>
              </li>
            </ul>
          </div>
        }
      />

      <section id="credits" className="scroll-mt-4">
        <Card className="border-0" size="full" title="Credits" content={<Credits />} />
      </section>
    </main>
  );
};
