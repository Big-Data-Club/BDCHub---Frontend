export const sidebarMinimum = 220;
export const sidebarMaximum = (viewport: number) =>
  Math.max(sidebarMinimum, Math.min(480, Math.floor(viewport * 0.38)));
export function sidebarWidth(width: number, viewport: number) {
  return Math.round(
    Math.min(
      sidebarMaximum(viewport),
      Math.max(sidebarMinimum, Number.isFinite(width) ? width : 280),
    ),
  );
}
