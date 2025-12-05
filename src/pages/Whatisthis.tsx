import { Discord, XLight } from "@ridemountainpig/svgl-react";
import CandlestickChart from "../components/Candles/candles";
import { Card } from "../components/Card";
import { PowerCard } from "../components/PowerCards/card";
import type { PowerDescription } from "../types/types";

const fakepowers: PowerDescription[] = [
  {
    rarity: 0.2,
    durationTicks: 15,
    iconSlug: "stop",
    title: "The Hacker: DDoS Attack",
    description:
      "Communicate with other players to strategize and share information.",
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
      "Trigger a false rumor that causes a random shock to the market for 20 seconds (everyone suffers).",
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

export const WhatIsThisPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-base-100 p-4">
      <section className="grid grid-cols-2 gap-4 md:px-20 mb-10">
        <div className="hero bg-base-200 col-span-2 min-h-screen">
          <div className="hero-content flex-col lg:flex-row">
            <CandlestickChart />
            <div>
              <h1 className="text-5xl font-bold">
                Multiplayer trading simulator with a twist.
              </h1>
              <p className="py-6">
                Try to get the trade virtual stocks, utilize special powers, and
                compete with other players to become the ultimate Stonk Lord!
              </p>
              <button className="btn btn-primary">Play for FREE</button>
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
          className={"col-span-1 border-0"}
          size="lg"
          title="Random Powers"
          content="Powers are special abilities that can give you an edge in the market. You can acquire them randomly and use them strategically to influence stock prices or gain insights."
        />

        <Card
          className={"col-span-2 h-50"}
          size="full"
          title="Socials"
          content={
            <div className="flex justify-end">
              <ul className="menu menu-vertical lg:menu-horizontal">
                <li>
                  <a
                    href="https://discord.gg/QyjFdGSmTm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Discord <Discord width={"4rem"} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/jybendev"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter / X <XLight width={"3.2rem"} />
                  </a>
                </li>
              </ul>
            </div>
          }
        />
      </section>
    </div>
  );
};
