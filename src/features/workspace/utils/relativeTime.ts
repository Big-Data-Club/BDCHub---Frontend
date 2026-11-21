export function relativeTime(value: string, now = Date.now()) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "chưa xác định";
  const seconds = Math.max(0, Math.floor((now - parsed) / 1000));
  if (seconds < 60) return "vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} ngày trước`;
  return new Date(parsed).toLocaleDateString("vi-VN");
}
