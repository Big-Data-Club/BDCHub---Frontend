/**
 * Bộ giải phương trình Cubic Bezier bằng phương pháp tìm kiếm nhị phân (Bisection Search).
 * Được sử dụng trong chế độ "scrub mode" để tính toán giá trị nội suy cho frame hoạt ảnh.
 */
export function solveBezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let start = 0;
  let end = 1;
  let t = 0.5;
  for (let i = 0; i < 14; i++) {
    const curX = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
    if (Math.abs(curX - x) < 0.0001) break;
    if (curX < x) {
      start = t;
    } else {
      end = t;
    }
    t = (start + end) / 2;
  }
  return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
}
