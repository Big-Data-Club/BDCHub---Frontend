/**
 * Static background shared by public and authentication pages.
 *
 * This intentionally uses no canvas, Web Worker, event listener, or animation
 * loop. The previous animated star field repainted the whole viewport at 30fps
 * for the entire visit, which kept the CPU/GPU active even while the page was
 * idle.
 */
export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50 dark:bg-[#050B18]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(59,130,246,0.10),transparent_45%),radial-gradient(ellipse_at_85%_80%,rgba(14,165,233,0.08),transparent_42%)] dark:bg-[radial-gradient(ellipse_at_15%_10%,rgba(37,99,235,0.16),transparent_45%),radial-gradient(ellipse_at_85%_80%,rgba(6,182,212,0.10),transparent_42%)]" />
    </div>
  );
}
