/* eslint-disable @next/next/no-img-element -- fixed-size pixel sprites from the original game */
import type { EcoEntity } from "../lib/economy";
import { formatSecs, sprite } from "../lib/economy";

export type Mode =
  | { type: "place"; kind: string }
  | { type: "move"; id: string }
  | null;
export type Tab = "CROP" | "ANIMAL" | "STRUCTURE" | "SUPPLY" | "DECOR";
export const TABS: { key: Tab; label: string; symbol: string }[] = [
  { key: "CROP", label: "Trồng cây", symbol: "🌾" },
  { key: "ANIMAL", label: "Vật nuôi", symbol: "🐓" },
  { key: "STRUCTURE", label: "Xây dựng", symbol: "🏠" },
  { key: "SUPPLY", label: "Vật tư", symbol: "💊" },
  { key: "DECOR", label: "Trang trí", symbol: "🌼" },
];
const symbols: Record<string, string> = {
  paddy: "🌾",
  meal: "🍚",
  aid_rice: "🍚",
  medicine: "💊",
  oxygen: "🫧",
  fish_feed: "🐟",
  frog_feed: "🪱",
  chicken_product: "🍗",
  fish_product: "🐟",
  frog_product: "🐸",
  mustard: "🥬",
};
const pixelKinds = new Set([
  "rice_crop",
  "water_spinach",
  "mustard",
  "flower",
  "chicken",
  "frog",
  "bee",
  "fish",
  "farmer",
  "fence",
  "tank",
  "pond",
  "hive",
  "aquaponics",
  "bench",
  "flowerpot",
  "egg",
  "honey",
  "rice",
  "insect",
]);
export function Pix({ kind, size = 50 }: { kind: string; size?: number }) {
  return (
    <span className="eco-pix" style={{ width: size, height: size }}>
      {pixelKinds.has(kind) ? (
        <img src={sprite(kind)} width={size} height={size} alt="" />
      ) : (
        <span className="eco-fallback" aria-hidden="true">
          {symbols[kind] || "🍀"}
        </span>
      )}
    </span>
  );
}
export function nextActionForSupply(
  kind: string,
  picked: EcoEntity | undefined,
): { action: string; item?: string } | null {
  if (kind === "paddy" && picked?.kind === "chicken")
    return { action: "FEED", item: kind };
  if (["insect", "frog_feed"].includes(kind) && picked?.kind === "frog")
    return { action: "FEED", item: kind };
  if (["water_spinach", "fish_feed"].includes(kind) && picked?.kind === "fish")
    return { action: "FEED", item: kind };
  if (kind === "medicine" && picked?.category === "ANIMAL")
    return { action: "MEDICINE" };
  if (
    kind === "oxygen" &&
    ["pond", "tank", "aquaponics"].includes(picked?.kind || "")
  )
    return { action: "OXYGEN" };
  return null;
}
export function stateText(o: EcoEntity): string {
  if (o.buildLeft > 0) return `Đang xây · ${formatSecs(o.buildLeft)}`;
  if (o.sick) return "Cần chữa bệnh";
  if (o.category === "CROP" && o.onAquaponics && !o.aquaActive)
    return "Giàn thiếu oxy · cây tạm dừng";
  if (o.category === "CROP" && o.onAquaponics && o.regrowLeft > 0)
    return `Cây tái sinh sau ${formatSecs(o.regrowLeft)}`;
  if (o.category === "CROP")
    return o.ready > 0
      ? "Sẵn sàng thu hoạch"
      : o.regrowLeft > 0
        ? `Đang nghỉ · ${formatSecs(o.regrowLeft)}`
        : o.needsRewater
          ? "Tưới lại để cây lớn tiếp"
          : o.waterPct === 0
            ? "Cần tưới nước"
            : "Đang lớn";
  if (o.category === "ANIMAL") {
    if (o.kind === "fish" || o.kind === "frog") {
      if (o.habitatBuildLeft > 0)
        return `Ao/thùng đang xây · ${formatSecs(o.habitatBuildLeft)}`;
      if (!o.housed) return "Chưa nằm trong ao/thùng";
      if (!o.hasOxygen) return `Ao/thùng còn ${o.habitatOxygen}% oxy · Cần bơm`;
    }
    if (o.kind === "bee" && !o.flowerNearby) return "Cần hoa đang nở";
    return o.ready > 0
      ? "Có thể thu hoạch"
      : o.hungerPct === 0
        ? "Đang đói · Tạm dừng"
        : "Đang phát triển";
  }
  if (
    o.category === "STRUCTURE" &&
    ["pond", "tank", "aquaponics"].includes(o.kind) &&
    o.oxygen <= 15
  )
    return "Thiếu oxy · sản xuất tạm dừng";
  return "Sẵn sàng";
}
