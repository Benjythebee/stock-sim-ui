import { useGameStore } from "../../context/game.context";
import { usePriceStore } from "../../context/stock.store";
import { Chart } from "react-chartjs-2";
import {CategoryScale} from 'chart.js';
import {Chart as ChartJS, LinearScale,TimeSeriesScale} from 'chart.js';
import {CandlestickController,CandlestickElement,OhlcController} from "chartjs-chart-financial";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import 'chartjs-adapter-luxon'

ChartJS.register(CategoryScale, LinearScale,TimeSeriesScale,CandlestickController,OhlcController, CandlestickElement);

export const TradingChart = () => {
  const { settings } = useGameStore(useShallow((state) => ({
    settings: state.gameSettings,
  })));
  const { prices } = usePriceStore(useShallow((state) => ({
    price: state.price,
    prices: state.prices,
  })));

  const memoizedScale = useMemo(() => {
    const scale = {min: 0, max: 0};
      const prices_ = prices.length? prices.map(c => [c.l, c.h]).flat() : [];
      const minP = Math.min(...prices_)
      const maxP = Math.max(...prices_)

      const minPrice = isFinite(minP) ? minP : 0;
      const maxPrice = isFinite(maxP) ? maxP : 1;
      scale.min = minPrice * 0.95;
      scale.max = maxPrice * 1.05;
      return scale
  }, [prices]);

  return (
    <div className="card bg-base-200 flex-1 min-h-[500px]">
      <div className="card-body">
        <h2 className="card-title">{settings.ticketName} Chart</h2>
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
