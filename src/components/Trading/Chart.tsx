import { useGameStore } from "../../context/game.context";
import { usePriceStore } from "../../context/stock.store";
import { Chart } from "react-chartjs-2";
import {CategoryScale} from 'chart.js';
import {Chart as ChartJS, LinearScale,TimeSeriesScale, PointElement,LineController,LineElement} from 'chart.js';
import {CandlestickController,CandlestickElement,OhlcController} from "chartjs-chart-financial";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import 'chartjs-adapter-luxon'
import { useDebugStore } from "../../context/debug.store";
import { PowerButton } from "./PowerButton";
import { SelectedCards } from "../cards/selected.cards";

ChartJS.register(CategoryScale, LinearScale,TimeSeriesScale,CandlestickController,OhlcController, CandlestickElement, PointElement,LineController,LineElement);

export const TradingChart = () => {
  const { settings } = useGameStore(useShallow((state) => ({
    settings: state.gameSettings,
  })));

  const { prices ,price} = usePriceStore(useShallow((state) => ({
    price: state.price,
    prices: state.prices,
  })));

  const {intrinsicValues, guidePrices} = useDebugStore(useShallow((state) => ({
    intrinsicValues: state.intrinsicValues,
    guidePrices: state.guidePrices,
  })));

  const memoizedScale = useMemo(() => {
    const scale = {min: 0, max: 0};
      const prices_ = prices.length? prices.map(c => [c.l, c.h]).flat() : [];
      const minP = Math.min(...prices_,intrinsicValues[intrinsicValues.length -1] || prices_[intrinsicValues.length -1])
      const maxP = Math.max(...prices_,intrinsicValues[intrinsicValues.length -1] || prices_[intrinsicValues.length -1])

      const minPrice = isFinite(minP) ? minP : 0;
      const maxPrice = isFinite(maxP) ? maxP : 1;
      scale.min = minPrice * 0.95;
      scale.max = maxPrice * 1.05;
      return scale
  }, [prices,intrinsicValues]);



  return (
    <div className="card bg-base-200 flex-1 min-h-[500px]">
      <div className="card-body relative">
        <h2 className="card-title">Trading {settings.ticketName}, ${price}</h2>
        <div className="absolute top-5 right-5 flex">
          <SelectedCards />
          <PowerButton />
        </div>
        <div
          id={"chart-container"}
          className="flex-1 flex items-center justify-center border-2 border-dashed border-base-300 rounded-lg"
        >
          <Chart
            type="candlestick"
            data={{
              datasets: [
                {
                  label: "Close price",
                  data: prices,
                  // borderColor: 'rgb(75, 192, 192)',
                  // backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  // tension: 0.1
                },
                {
                  label: "Intrinsic Value",
                  data: intrinsicValues.map((value, index) => ({ x: prices[index].x, y: value })) as unknown[],
                  type: 'line',
                  borderColor: 'rgb(54, 162, 235)', // blue
                },
                {
                  label: "Guide Price",
                  data: guidePrices.map((value, index) => ({ x: prices[index].x, y: value })) as unknown[],
                  type: 'line',
                  borderColor: 'rgb(255, 99, 132)',
                  
                }
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Time",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Price",
                  },
                  min: memoizedScale.min,
                  max: memoizedScale.max,
                },
              },
              plugins: {
                tooltip:{
                  enabled: true,
                },
                legend: {
                  display: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
