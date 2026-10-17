import type { EcoEntity } from "./economy";

export type ActionKey = "1" | "2" | "3" | "4";
export type EntityCommand =
  | "WATER"
  | "HARVEST"
  | "FEED"
  | "MEDICINE"
  | "SELL_CHICKEN"
  | "OXYGEN"
  | "OXYGEN_HABITAT";
export type FarmShortcut = {
  key: ActionKey;
  label: string;
  command: EntityCommand;
  enabled: boolean;
  reason?: string;
};

/** Shared by the clickable inspector and keyboard controls so they never disagree. */
export function getEntityShortcuts(
  entity: EcoEntity | undefined,
): FarmShortcut[] {
  if (!entity) return [];
  if (entity.category === "CROP")
    return [
      {
        key: "1",
        label: entity.needsRewater ? "Tưới lại" : "Tưới cây",
        command: "WATER",
        enabled:
          !entity.onAquaponics &&
          entity.ready === 0 &&
          entity.waterPct <= 65 &&
          entity.regrowLeft <= 0,
        reason: entity.onAquaponics
          ? "Cây trên giàn aquaponics được tưới tự động."
          : entity.regrowLeft > 0
            ? "Cây đang nghỉ sau thu hoạch."
            : "Cây chưa cần tưới.",
      },
      {
        key: "2",
        label: "Thu hoạch",
        command: "HARVEST",
        enabled: entity.ready > 0,
        reason: "Cây chưa sẵn sàng thu hoạch.",
      },
    ];
  if (entity.category === "ANIMAL") {
    const list: FarmShortcut[] = [
      {
        key: "1",
        label: "Cho ăn",
        command: "FEED",
        enabled: entity.hungerPct <= 33,
        reason: "Vật nuôi chưa đói.",
      },
      {
        key: "2",
        label:
          entity.kind === "chicken"
            ? "Nhặt trứng"
            : entity.kind === "bee"
              ? "Lấy mật"
              : "Thu hoạch",
        command: "HARVEST",
        enabled: entity.ready > 0,
        reason: "Chưa đến lúc thu hoạch.",
      },
    ];
    if (entity.sick)
      list.push({
        key: "3",
        label: "Chữa bệnh",
        command: "MEDICINE",
        enabled: true,
      });
    if (entity.kind === "chicken")
      list.push({
        key: entity.sick ? "4" : "3",
        label: "Bán gà thịt",
        command: "SELL_CHICKEN",
        enabled: true,
      });
    if (["fish", "frog"].includes(entity.kind) && entity.habitatId) {
      list.push({
        key: entity.sick ? "4" : "3",
        label: "Bơm oxy cho ao/thùng",
        command: "OXYGEN_HABITAT",
        enabled: entity.housed && entity.habitatOxygen <= 65,
        reason: entity.housed
          ? "Oxy vẫn còn đủ."
          : "Cần có ao hoặc thùng hợp lệ.",
      });
    }
    return list;
  }
  if (
    entity.category === "STRUCTURE" &&
    ["tank", "pond", "aquaponics"].includes(entity.kind)
  )
    return [
      {
        key: "1",
        label: "Bổ sung oxy",
        command: "OXYGEN",
        enabled: entity.buildLeft <= 0 && entity.oxygen <= 65,
        reason:
          entity.buildLeft > 0 ? "Công trình đang xây." : "Oxy vẫn còn đủ.",
      },
    ];
  return [];
}

/** A keyboard nudge only changes the preview, never server state. */
export function nudgeMovePreview(
  cursor: { x: number; y: number },
  key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
  footprint: { width: number; height: number },
  grid: { width: number; height: number },
): { x: number; y: number } {
  const dx = key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0;
  const dy = key === "ArrowDown" ? 1 : key === "ArrowUp" ? -1 : 0;
  return {
    x: Math.max(0, Math.min(grid.width - footprint.width, cursor.x + dx)),
    y: Math.max(0, Math.min(grid.height - footprint.height, cursor.y + dy)),
  };
}

export function shouldIgnoreFarmShortcut(
  target: EventTarget | null,
  ctrl: boolean,
  alt: boolean,
  meta: boolean,
): boolean {
  if (ctrl || alt || meta) return true;
  if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement))
    return false;
  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="textbox"]',
    ),
  );
}
