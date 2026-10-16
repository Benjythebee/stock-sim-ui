/** Covers the order form while we're DDoSed (the server's only trading lock), terminal style. */
export const HackedOverlay = () => (
  <div
    role="status"
    className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none rounded-box border border-green-500/60 bg-black/85 p-3 font-mono text-xs text-green-400 shadow-lg"
  >
    <div className="font-bold">&gt; SYSTEM COMPROMISED</div>
    <div>DDoS attack in progress.</div>
    <div>Trading offline<span className="hacked-cursor">_</span></div>
  </div>
);
