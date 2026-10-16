import { ChartCandlestick, ChartLine, ChevronsRight, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "../../utils/cn";

export type ChartStyle = 'candles' | 'line';

/** Candlesticks or a plain line of closing prices. */
export const ChartStyleToggle = ({value, onChange}: {value: ChartStyle; onChange: (style: ChartStyle) => void}) => (
  <div className="join" role="group" aria-label="Chart style">
    <button
      className={cn("btn btn-xs join-item", value === 'candles' && "btn-active")}
      aria-label="Candlestick chart"
      aria-pressed={value === 'candles'}
      title="Candlestick chart"
      onClick={() => onChange('candles')}
    >
      <ChartCandlestick size={14} />
    </button>
    <button
      className={cn("btn btn-xs join-item", value === 'line' && "btn-active")}
      aria-label="Line chart"
      aria-pressed={value === 'line'}
      title="Line chart"
      onClick={() => onChange('line')}
    >
      <ChartLine size={14} />
    </button>
  </div>
);

const zoomLabel = (seconds: number) =>
  seconds === Infinity ? 'All' : seconds < 60 ? `${seconds}s` : `${seconds / 60}m`;

/**
 * Candle / line toggle, zoom out / window size / zoom in, and a "Live" button while scrolled back
 * into history.
 */
export const ZoomControls = ({chartStyle, onChartStyle, windowSize, canZoomIn, canZoomOut, onZoom, live, onGoLive}: {
  chartStyle: ChartStyle;
  onChartStyle: (style: ChartStyle) => void;
  /** Visible window in candles (= game seconds); Infinity = the whole game. */
  windowSize: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  /** +1 zooms out, -1 zooms in. */
  onZoom: (step: number) => void;
  live: boolean;
  onGoLive: () => void;
}) => (
  <div className="flex items-center gap-2 self-end sm:self-auto">
    <ChartStyleToggle value={chartStyle} onChange={onChartStyle} />
    <div className="join" title="Scroll on the chart to zoom, drag or shift + scroll to look back">
      <button className="btn btn-xs join-item" aria-label="Zoom out" disabled={!canZoomOut} onClick={() => onZoom(1)}>
        <ZoomOut size={14} />
      </button>
      <span className="btn btn-xs join-item pointer-events-none w-10 tabular-nums">{zoomLabel(windowSize)}</span>
      <button className="btn btn-xs join-item" aria-label="Zoom in" disabled={!canZoomIn} onClick={() => onZoom(-1)}>
        <ZoomIn size={14} />
      </button>
    </div>
    {!live && (
      <button className="btn btn-xs btn-primary" onClick={onGoLive}>
        Live <ChevronsRight size={14} />
      </button>
    )}
  </div>
);
