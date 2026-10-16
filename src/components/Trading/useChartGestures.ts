import { useEffect, useEffectEvent, type RefObject } from "react";

/**
 * Pointer and wheel input on the chart container: a horizontal drag calls `onDrag(dx)` with the pixels
 * moved since the last call, and every wheel event goes to `onWheel` (which decides whether to
 * preventDefault). A drag never ends in a click, or releasing over an order tag's × would cancel it.
 */
export function useChartGestures(containerRef: RefObject<HTMLElement | null>, handlers: {
  onDrag: (dx: number) => void;
  onWheel: (e: WheelEvent) => void;
}) {
  const onDrag = useEffectEvent(handlers.onDrag);
  const onWheel = useEffectEvent(handlers.onWheel);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let drag: { id: number; x: number; moved: boolean } | null = null;
    let swallowClick = false;
    const down = (e: PointerEvent) => {
      swallowClick = false;
      if (e.button === 0) drag = { id: e.pointerId, x: e.clientX, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 4) return;
        drag.moved = true;
        el.setPointerCapture(e.pointerId);
        el.dataset.dragging = '';
      }
      drag.x = e.clientX;
      onDrag(dx);
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      swallowClick = drag.moved;
      drag = null;
      delete el.dataset.dragging;
    };
    const click = (e: MouseEvent) => {
      if (swallowClick) e.stopPropagation();
      swallowClick = false;
    };
    const wheel = (e: WheelEvent) => onWheel(e);
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true);
    return () => {
      el.removeEventListener('wheel', wheel);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click, true);
    };
    // onWheel/onDrag are Effect Events: they must not be dependencies (this eslint-plugin version predates useEffectEvent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
