import { useGameStore } from "../../context/game.context";
import { usePriceStore } from "../../context/stock.store";
import { Chart } from "react-chartjs-2";
import {CategoryScale, Legend, TimeScale, Tooltip} from 'chart.js';
import {Chart as ChartJS, LinearScale,TimeSeriesScale, PointElement,LineController,LineElement} from 'chart.js';
import {CandlestickController,CandlestickElement,OhlcController} from "chartjs-chart-financial";
import { useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import 'chartjs-adapter-luxon'
import { useDebugStore } from "../../context/debug.store";
import { PowerButton } from "./PowerButton";
import { SelectedCards } from "../PowerCards/selected.cards";
import { createChartOverlay, type ChartOverlayData } from "./chart.overlay";
import { cn } from "../../utils/cn";
import { ZoomControls } from "./chart.controls";
import { useChartGestures } from "./useChartGestures";
import { useGameActions } from "../../hooks/useGameActions";

ChartJS.register(CategoryScale, LinearScale,TimeScale,TimeSeriesScale,CandlestickController,OhlcController, CandlestickElement, PointElement,LineController,LineElement,Tooltip,Legend);

/** Visible window sizes in candles (= game seconds). Infinity shows the whole game. */
const ZOOM_LEVELS = [30, 60, 120, 240, 480, Infinity];
const DEFAULT_ZOOM = 2;
const CANDLE_MS = 1000;
/** Faint dotted grid, readable on both themes. */
const GRID_COLOR = 'rgba(127, 127, 127, 0.18)';
const GRID_DASH = [2, 4];

/**
 * Where a scrolled-back view ends: never before the first full window, and null (live) once it
 * reaches the latest candle. "All" shows everything, so there's nothing to pan.
 */
const clampPan = (end: number | null, firstX: number, lastX: number, windowSize: number) => {
  if (end === null || windowSize === Infinity) return null;
  const earliest = Math.min(lastX, firstX + (windowSize - 1) * CANDLE_MS);
  const clamped = Math.max(earliest, end);
  return clamped >= lastX ? null : clamped;
};

export const TradingChart = ({className}: {className?: string}) => {
  const { cancelOrder } = useGameActions();
  const { settings, openOrders, news } = useGameStore(useShallow((state) => ({
    settings: state.gameSettings,
    openOrders: state.openOrders,
    news: state.news,
  })));

  const { prices ,price, clock} = usePriceStore(useShallow((state) => ({
    price: state.price,
    prices: state.prices,
    clock: state.clock,
  })));

  const {intrinsicValues, guidePrices} = useDebugStore(useShallow((state) => ({
    intrinsicValues: state.intrinsicValues,
    guidePrices: state.guidePrices,
  })));

  // The fair value / guide price lines only exist when the host enabled "Reveal hidden prices";
  // otherwise the server never sends them.
  const revealPrices = !!settings.revealPrices;

  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const windowSize = ZOOM_LEVELS[zoom];
  const zoomBy = (step: number) => setZoom((z) => Math.min(ZOOM_LEVELS.length - 1, Math.max(0, z + step)));

  // Time of the rightmost visible candle when scrolled back into history; null = live (follow the latest).
  const [panEnd, setPanEnd] = useState<number | null>(null);
  const chartRef = useRef<ChartJS<'candlestick'>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const panBy = (ms: number) => {
    const { prices } = usePriceStore.getState();
    if (!prices.length || !ms) return;
    const firstX = Number(prices[0].x);
    const lastX = Number(prices[prices.length - 1].x);
    setPanEnd((end) => clampPan((end ?? lastX) + ms, firstX, lastX, windowSize));
  };
  /** Chart time per CSS pixel, to turn drags and horizontal scrolls into a pan. */
  const msPerPx = () => {
    const chart = chartRef.current;
    if (!chart?.chartArea?.width) return 0;
    return (chart.scales.x.max - chart.scales.x.min) / chart.chartArea.width;
  };

  // Vertical scroll zooms (up = closer), one step per gesture-ish so a trackpad doesn't fly through every
  // level. Horizontal scroll (or shift + scroll) pans.
  const lastZoomAt = useRef(0);
  const onWheel = (e: WheelEvent) => {
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
    if (horizontal) {
      e.preventDefault();
      panBy((e.deltaX || e.deltaY) * msPerPx());
      return;
    }
    if (e.deltaY === 0) return;
    e.preventDefault();
    const now = performance.now();
    if (now - lastZoomAt.current < 150) return;
    lastZoomAt.current = now;
    zoomBy(e.deltaY > 0 ? 1 : -1);
  };
  // The gesture hook always calls the latest handlers, so these can close over this render's state.
  useChartGestures(containerRef, {
    onWheel,
    onDrag: (dx) => panBy(-dx * msPerPx()),
  });

  // Rolling window: the latest candle (or the panned-to one) sits at the right edge, `windowSize` candles
  // back to the left (or back to the first candle, so a young game isn't mostly empty space).
  const view = useMemo(() => {
    const lastX = prices.length ? Number(prices[prices.length - 1].x) : clock;
    const firstX = prices.length ? Number(prices[0].x) : clock;
    const endX = clampPan(panEnd, firstX, lastX, windowSize) ?? lastX;
    const minX = Math.max(firstX, endX - (windowSize - 1) * CANDLE_MS) - CANDLE_MS / 2;
    const maxX = endX + CANDLE_MS / 2;
    const start = prices.findIndex((p) => Number(p.x) >= minX);
    const from = start === -1 ? prices.length : start;
    const stop = prices.findIndex((p) => Number(p.x) > maxX);
    const to = stop === -1 ? prices.length : stop;
    const series = (values: number[]) =>
      values.slice(from, to).flatMap((y, i) => prices[from + i] ? [{ x: Number(prices[from + i].x), y }] : []);
    return {
      minX,
      maxX,
      live: endX === lastX,
      candles: prices.slice(from, to),
      intrinsic: revealPrices ? series(intrinsicValues) : [],
      guide: revealPrices ? series(guidePrices) : [],
    };
  }, [prices, clock, windowSize, panEnd, revealPrices, intrinsicValues, guidePrices]);

  // Fit the price axis to what's visible, with a little headroom.
  const yRange = useMemo(() => {
    const values = [
      ...view.candles.flatMap((c) => [c.l, c.h]),
      ...view.intrinsic.map((p) => p.y),
      ...view.guide.map((p) => p.y),
    ].filter((v) => v > 0);
    if (!values.length) return { min: 0, max: 1 };
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const pad = Math.max((hi - lo) * 0.1, (hi + lo) / 2 * 0.01, 0.01);
    return { min: Math.max(0, lo - pad), max: hi + pad };
  }, [view]);

  // The overlay plugin is created once; it reads the latest orders and news from this ref on every draw.
  const overlay = useRef<ChartOverlayData>({ orders: [], news: [] });
  overlay.current = {
    orders: openOrders,
    news,
    onCancel: (ids) => ids.forEach(cancelOrder),
  };
  const plugins = useMemo(() => [createChartOverlay(() => overlay.current)], []);

  return (
    <div className={cn("card bg-base-200 flex-1 min-h-[420px] sm:min-h-[500px]", className)}>
      <div className="card-body">
        {/* Ticker and price centered between the chart controls and the powers. On phones the ticker
            takes the first row and the controls and powers share the second. */}
        <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
          <ZoomControls
            windowSize={windowSize}
            canZoomIn={zoom > 0}
            canZoomOut={zoom < ZOOM_LEVELS.length - 1}
            onZoom={zoomBy}
            live={view.live}
            onGoLive={() => setPanEnd(null)}
          />
          {/* Fixed-width digits so the header doesn't shift on every tick. */}
          <h2 className="card-title justify-center gap-3 whitespace-nowrap col-span-2 sm:col-span-1 order-first sm:order-none">
            <span>{settings.ticketName}</span>
            <span className="tabular-nums">${price.toFixed(2)}</span>
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-y-2 min-w-0">
            <SelectedCards />
            <PowerButton />
          </div>
        </div>
        <div
          id={"chart-container"}
          ref={containerRef}
          className="flex-1 flex items-center justify-center border-2 border-dashed border-base-300 rounded-lg cursor-grab data-dragging:cursor-grabbing touch-pan-y select-none"
        >
          <Chart
            ref={chartRef}
            type="candlestick"
            plugins={plugins}
            data={{
              datasets: [
                {
                  label: "Price",
                  data: view.candles,
                  maxBarThickness: 24,
                },
                ...(revealPrices ? [
                {
                  label: "Intrinsic Value",
                  data: view.intrinsic as unknown[],
                  type: 'line' as const,
                  borderColor: 'rgb(54, 162, 235)', // blue
                  borderWidth: 1.5,
                  pointRadius: 0,
                },
                {
                  label: "Guide Price",
                  data: view.guide as unknown[],
                  type: 'line' as const,
                  borderColor: 'rgb(255, 99, 132)',
                  borderWidth: 1.5,
                  pointRadius: 0,
                },
              ] : []),
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              // Prices tick 5x a second; animating every update makes the candles lag behind.
              animation: false,
              scales: {
                x: {
                  type: 'time',
                  min: view.minX,
                  max: view.maxX,
                  offset: false,
                  time: {
                    minUnit: 'second',
                    displayFormats: { second: 'HH:mm:ss', minute: 'HH:mm' },
                    tooltipFormat: 'HH:mm:ss',
                  },
                  ticks: { source: 'auto', maxRotation: 0, autoSkipPadding: 40 },
                  grid: { color: GRID_COLOR, drawTicks: false },
                  border: { display: false, dash: GRID_DASH },
                },
                y: {
                  // Price on the right, like most trading charts; order tags sit on the left.
                  position: 'right',
                  min: yRange.min,
                  max: yRange.max,
                  ticks: { callback: (value) => `$${Number(value).toFixed(2)}` },
                  grid: { color: GRID_COLOR, drawTicks: false },
                  border: { display: false, dash: GRID_DASH },
                },
              },
              plugins: {
                tooltip:{
                  enabled: true,
                },
                legend: {
                  // Only the practice-mode lines need a key; the candles explain themselves.
                  display: revealPrices,
                  labels: { filter: (item) => item.datasetIndex !== 0 },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
