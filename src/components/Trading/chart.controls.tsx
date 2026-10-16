import { ChevronsRight, ZoomIn, ZoomOut } from "lucide-react";

const zoomLabel = (seconds: number) =>
  seconds === Infinity ? 'All' : seconds < 60 ? `${seconds}s` : `${seconds / 60}m`;

/** Zoom out / window size / zoom in, and a "Live" button while scrolled back into history. */
export const ZoomControls = ({windowSize, canZoomIn, canZoomOut, onZoom, live, onGoLive}: {
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
