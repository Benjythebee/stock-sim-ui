import { Discord, XLight } from "@ridemountainpig/svgl-react";
import CandlestickChart from "../components/Candles/candles";
import { Card } from "../components/ui/card";
import { Collapse } from "../components/ui/collapse";
import { ExternalLink } from "../components/ui/external-link";
import { PowerCard } from "../components/PowerCards/card";
import type { PowerDescription } from "../types/types";
import { Credits } from "../components/Credits";
import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { DISCORD_URL, X_URL } from "../components/footer";

const fakepowers: PowerDescription[] = [
  {
    rarity: 0.2,
    durationTicks: 15,
    iconSlug: "stop",
    title: "The Hacker: DDoS Attack",
    description:
      "Launch a DDoS attack on all traders, disabling their ability to trade for 15 seconds.",
    type: "others",
    isInstant: false,
    id: "the-hacker-ddos",
  },
  {
    rarity: 0.2,
    durationTicks: 30,
    iconSlug: "talk",
    title: "Rumor Mill",
    description:
      "Spread a false rumor that jolts the market up or down for a few seconds (everyone suffers).",
    type: "market",
    isInstant: false,
    id: "21",
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
];

const HOW_TO_PLAY: { title: string; body: string }[] = [
  {
    title: "Open a room",
    body: "Pick a username and leave the room code empty to create a new room, or type a friend's code to join theirs. The first player in is the host.",
  },
  {
    title: "Set up the market",
    body: "The host picks the ticker, starting cash, opening price, volatility, game length and how many AI trading bots join, then hits start.",
  },
  {
    title: "Trade the order book",
    body: "Place limit or market orders to buy and sell against everyone else on a real limit order book. Watch the candlestick chart, the depth and the news feed.",
  },
  {
    title: "Open briefcases",
    body: "Eight briefcases drop during the game. Each one offers you three random power-ups: keep one, use it right away or save it for the right moment.",
  },
  {
    title: "Win on P&L",
    body: "When the clock runs out, players and bots are ranked by profit and loss. Highest P&L takes the tendies.",
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
    q: "How does the price move?",
    a: "Every trade happens on a real order book. A hidden fair value moves on news and power-ups, bots trade around it, and big trades from players push the price.",
  },
];

export const WhatIsThisPage: React.FC = () => {
  const { hash } = useLocation();
  // react-router doesn't scroll to #anchors itself (e.g. the footer's "Credits" link).
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <div className="relative min-h-screen bg-base-100 p-4">
      <section className="grid grid-cols-2 gap-4 md:px-20 mb-10">
        <div className="hero bg-base-200 col-span-2 min-h-screen relative overflow-hidden">
          {/* Decorative chart, dimmed behind the text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none scale-150" aria-hidden="true">
            <CandlestickChart />
          </div>
          <div className="hero-content relative z-10">
            <div>
              <h1 className="text-5xl font-bold">
                Multiplayer stock trading game with a twist.
              </h1>
              <p className="py-6">
                Tendies Brawl is a free browser party game. Trade a virtual
                stock against your friends and AI bots on a live order book,
                use random power-ups to swing the market, and finish with the
                best P&amp;L to win the brawl.
              </p>
              <Link to="/" className="btn btn-primary">Play for free</Link>
            </div>
          </div>
        </div>

        <div className="relative w-full">
          <div className="hand-of-cards-background"></div>
          <div className="hand-of-cards pointer-events-auto mx-12">
            <PowerCard
              className="scale-75 "
              power={fakepowers[0]}
              onClick={() => {}}
            />
            <PowerCard
              className="scale-75 hidden md:block"
              power={fakepowers[1]}
              onClick={() => {}}
            />
            <PowerCard
              className="scale-75 "
              power={fakepowers[2]}
              onClick={() => {}}
            />
          </div>
        </div>
        <Card
          className={"col-span-1 border-0 max-w-full"}
          size="lg"
          title="Random power-ups"
          content={
            <p>
              Like items in a kart racer, power-ups give you an edge. Collect
              cash, get an insider tip on the stock's real value, spread a
              rumor, whip up a volatility storm, or DDoS everyone else so
              nobody can trade but you.
            </p>
          }
        />

        <section className="col-span-2" aria-labelledby="how-to-play">
          <h2 id="how-to-play" className="text-3xl font-bold mb-4">How to play</h2>
          <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {HOW_TO_PLAY.map((step, i) => (
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
        </section>

        <section className="col-span-2" aria-labelledby="faq">
          <h2 id="faq" className="text-3xl font-bold mb-4">FAQ</h2>
          <div className="flex flex-col gap-2">
            {FAQ.map(({ q, a }) => (
              <Collapse key={q} title={q} className="bg-base-200"><p>{a}</p></Collapse>
            ))}
          </div>
        </section>

        <Card
          className={"col-span-2 h-50"}
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

        <section id="credits" className="col-span-2 scroll-mt-4">
          <Card className="border-0" size="full" title="Credits" content={<Credits />} />
        </section>
      </section>
    </div>
  );
};
