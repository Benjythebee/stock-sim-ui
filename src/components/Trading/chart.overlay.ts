import type { Chart, ChartArea, Plugin } from 'chart.js';
import type { NewsMessage, OrderInfo } from '../../types/messages';

/** What the overlay draws, read on every draw (the chart outlives React renders). */
export type ChartOverlayData = {
  /** Open limit orders, drawn as horizontal lines at their price. */
  orders: OrderInfo[];
  /** News headlines, drawn as a vertical line + bell at the game time they hit. */
  news: NewsMessage[];
  /** Click on an order tag's ×. Omitted (spectators) = no cancel button. */
  onCancel?: (ids: number[]) => void;
};

type Rect = { x: number; y: number; w: number; h: number };
type Hit = (Rect & { kind: 'cancel'; ids: number[] }) | (Rect & { kind: 'news'; index: number });

// Lucide "bell" (24x24, stroked), so the marker matches the icons used across the UI.
const BELL_PATHS = [
  'M10.268 21a2 2 0 0 0 3.464 0',
  'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326',
];
let bellPaths: Path2D[] | null = null;

const FONT = '600 11px ui-sans-serif, system-ui, sans-serif';
const TAG_H = 18;
const BELL_R = 9;

const inside = (r: Rect, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/** Same marker across redraws (its position changes as the chart scrolls). */
const sameTarget = (a: Hit, b: Hit) =>
  a.kind === 'news' ? b.kind === 'news' && a.index === b.index : b.kind === 'cancel' && a.ids[0] === b.ids[0];

/** DaisyUI theme colors, read live so light/dark switches apply on the next draw. */
const themeColors = (canvas: HTMLCanvasElement) => {
  const style = getComputedStyle(canvas);
  const v = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    buy: v('--color-success', '#22c55e'),
    buyContent: v('--color-success-content', '#052e16'),
    sell: v('--color-error', '#ef4444'),
    sellContent: v('--color-error-content', '#450a0a'),
    info: v('--color-info', '#38bdf8'),
    infoContent: v('--color-info-content', '#082f49'),
    base: v('--color-base-100', '#ffffff'),
    content: v('--color-base-content', '#1f2937'),
  };
};

/** Same open orders on the same side and price are one line (summed quantity, cancelled together). */
const groupOrders = (orders: OrderInfo[]) => {
  const groups = new Map<string, { action: OrderInfo['action']; price: number; qty: number; ids: number[] }>();
  for (const o of orders) {
    if (o.status !== 'open' || o.price === null) continue;
    const key = `${o.action}:${o.price}`;
    const group = groups.get(key) ?? { action: o.action, price: o.price, qty: 0, ids: [] };
    group.qty += o.quantity - o.filled;
    group.ids.push(o.id);
    groups.set(key, group);
  }
  return [...groups.values()];
};

const roundRect = (ctx: CanvasRenderingContext2D, r: Rect, radius: number) => {
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
};

/** Word-wrap `text` to `maxWidth`, at most `maxLines` lines (the last one ellipsized). */
const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) => {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s*\S*$/, '')}…`;
  }
  return lines;
};

/**
 * Chart.js plugin drawing the player's open limit orders (dashed price lines with a tag; × cancels)
 * and news markers (dotted vertical line with a bell; hover shows the headline).
 */
export const createChartOverlay = (getData: () => ChartOverlayData): Plugin<'candlestick'> => {
  let hits: Hit[] = [];
  let hovered: Hit | null = null;

  const drawOrders = (chart: Chart, area: ChartArea, colors: ReturnType<typeof themeColors>) => {
    const { ctx } = chart;
    const y = chart.scales.y;
    const { onCancel } = getData();
    // Higher prices first so stacked edge tags read top-down like the order book.
    const groups = groupOrders(getData().orders).sort((a, b) => b.price - a.price);
    let aboveCount = 0;
    let belowCount = 0;

    for (const group of groups) {
      const buy = group.action === 'BUY';
      const color = buy ? colors.buy : colors.sell;
      const textColor = buy ? colors.buyContent : colors.sellContent;
      const py = y.getPixelForValue(group.price);
      const above = py < area.top;
      const below = py > area.bottom;

      let tagY: number;
      if (above) tagY = area.top + 4 + (aboveCount++) * (TAG_H + 3);
      else if (below) tagY = area.bottom - 4 - TAG_H - (belowCount++) * (TAG_H + 3);
      else {
        tagY = py - TAG_H / 2;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(area.left, Math.round(py) + 0.5);
        ctx.lineTo(area.right, Math.round(py) + 0.5);
        ctx.stroke();
        ctx.restore();
      }

      // Off-screen orders get an arrow pointing to where they are instead of a line.
      const arrow = above ? '▲ ' : below ? '▼ ' : '';
      const label = `${arrow}${buy ? 'BUY' : 'SELL'} ${group.qty} @ $${group.price.toFixed(2)}`;
      ctx.save();
      ctx.font = FONT;
      const textW = ctx.measureText(label).width;
      const cancelW = onCancel ? 16 : 0;
      const tag: Rect = { x: area.left + 6, y: tagY, w: textW + 12 + cancelW, h: TAG_H };
      ctx.fillStyle = color;
      roundRect(ctx, tag, 4);
      ctx.fill();
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(label, tag.x + 6, tag.y + TAG_H / 2 + 0.5);

      if (onCancel) {
        const box: Rect = { x: tag.x + tag.w - cancelW - 2, y: tag.y + 2, w: cancelW, h: TAG_H - 4 };
        const isHovered = hovered?.kind === 'cancel' && hovered.ids[0] === group.ids[0];
        if (isHovered) {
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          roundRect(ctx, box, 3);
          ctx.fill();
        }
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 1.5;
        const cx = box.x + box.w / 2;
        const cy = box.y + box.h / 2;
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy - 3);
        ctx.lineTo(cx + 3, cy + 3);
        ctx.moveTo(cx + 3, cy - 3);
        ctx.lineTo(cx - 3, cy + 3);
        ctx.stroke();
        // A little more forgiving than the drawn box.
        hits.push({ x: box.x - 3, y: tag.y - 2, w: box.w + 6, h: TAG_H + 4, kind: 'cancel', ids: group.ids });
      }
      ctx.restore();
    }
  };

  const drawNews = (chart: Chart, area: ChartArea, colors: ReturnType<typeof themeColors>) => {
    const { ctx } = chart;
    const x = chart.scales.x;
    const news = getData().news;
    bellPaths ??= BELL_PATHS.map((d) => new Path2D(d));

    news.forEach((item, index) => {
      const px = x.getPixelForValue(item.timestamp);
      if (px < area.left || px > area.right) return;
      const cy = area.top + BELL_R + 2;
      ctx.save();
      ctx.strokeStyle = colors.info;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(Math.round(px) + 0.5, cy + BELL_R);
      ctx.lineTo(Math.round(px) + 0.5, area.bottom);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = colors.info;
      ctx.beginPath();
      ctx.arc(px, cy, BELL_R, 0, Math.PI * 2);
      ctx.fill();
      // Scale the 24px icon into the badge.
      const scale = 12 / 24;
      ctx.translate(px - 6, cy - 6);
      ctx.scale(scale, scale);
      ctx.strokeStyle = colors.infoContent;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const path of bellPaths!) ctx.stroke(path);
      ctx.restore();
      hits.push({ x: px - BELL_R, y: cy - BELL_R, w: BELL_R * 2, h: BELL_R * 2, kind: 'news', index });
    });
  };

  const drawNewsTooltip = (chart: Chart, area: ChartArea, colors: ReturnType<typeof themeColors>) => {
    if (hovered?.kind !== 'news') return;
    const item = getData().news[hovered.index];
    if (!item) return;
    const { ctx } = chart;
    const maxW = 240;
    const pad = 8;
    ctx.save();
    ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
    const title = wrap(ctx, item.title, maxW, 2);
    ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
    const body = wrap(ctx, item.description, maxW, 4);
    ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
    const widths = [...title.map((l) => ctx.measureText(l).width)];
    ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
    widths.push(...body.map((l) => ctx.measureText(l).width));
    const w = Math.min(maxW, Math.max(...widths)) + pad * 2;
    const h = title.length * 15 + body.length * 14 + pad * 2 + 2;
    const anchorX = hovered.x + hovered.w / 2;
    const box: Rect = {
      x: Math.min(Math.max(anchorX - w / 2, area.left), area.right - w),
      y: hovered.y + hovered.h + 6,
      w,
      h,
    };
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = colors.base;
    roundRect(ctx, box, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = colors.info;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = colors.content;
    ctx.textBaseline = 'top';
    let ty = box.y + pad;
    ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
    for (const line of title) {
      ctx.fillText(line, box.x + pad, ty);
      ty += 15;
    }
    ty += 2;
    ctx.globalAlpha = 0.75;
    ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
    for (const line of body) {
      ctx.fillText(line, box.x + pad, ty);
      ty += 14;
    }
    ctx.restore();
    // The bell scrolls left every candle; the open headline counts as hovered too, so it doesn't vanish
    // from under a still mouse.
    hits.push({ ...box, kind: 'news', index: hovered.index });
  };

  return {
    id: 'stonkOverlay',
    afterDatasetsDraw(chart) {
      const area = chart.chartArea;
      if (!area || !chart.scales.x || !chart.scales.y) return;
      const colors = themeColors(chart.canvas);
      hits = [];
      drawNews(chart, area, colors);
      drawOrders(chart, area, colors);
      // Markers scroll left every candle: follow the hovered one, or drop it once it's gone.
      if (hovered) hovered = hits.find((h) => sameTarget(h, hovered!)) ?? null;
    },
    beforeTooltipDraw() {
      // The candle tooltip would pile on top of a headline or an order tag.
      return !hovered;
    },
    afterDraw(chart) {
      // After the built-in tooltip, so the headline sits on top of everything.
      const area = chart.chartArea;
      if (area) drawNewsTooltip(chart, area, themeColors(chart.canvas));
    },
    afterEvent(chart, args) {
      const { event } = args;
      let hit: Hit | null = null;
      if (event.type !== 'mouseout' && event.x !== null && event.y !== null) {
        // Last drawn is on top.
        for (const h of hits) if (inside(h, event.x, event.y)) hit = h;
      }
      if (event.type === 'click' && hit?.kind === 'cancel') {
        getData().onCancel?.(hit.ids);
        return;
      }
      const same = hit && hovered ? sameTarget(hit, hovered) : hit === hovered;
      if (!same) {
        hovered = hit;
        chart.canvas.style.cursor = hit ? 'pointer' : '';
        args.changed = true;
      }
    },
  };
};
