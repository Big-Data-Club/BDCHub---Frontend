type Farm = {
  id: string;
  name: string;
  coins: number;
  xp: number;
  level: number;
};
export type EcoCatalogEntry = {
  label: string;
  category: "CROP" | "ANIMAL" | "STRUCTURE" | "DECOR";
  price: number;
  seconds?: number;
  yield?: string;
  amount?: number;
  food?: string;
  housing?: string;
  description: string;
};
export type EcoCatalog = Record<string, EcoCatalogEntry>;
export type EcoEntity = {
  refundCoins: number;
  onAquaponics: boolean;
  aquaActive: boolean;
  aquaOxygen: number;
  oxygenLeft: number;
  id: string;
  kind: string;
  category: "CROP" | "ANIMAL" | "STRUCTURE" | "DECOR";
  x: number;
  y: number;
  progress: number;
  hungerPct: number;
  waterPct: number;
  regrowLeft: number;
  needsRewater: boolean;
  health: number;
  sick: boolean;
  ready: number;
  oxygen: number;
  buildLeft: number;
  housed: boolean;
  habitatId?: string;
  habitatOxygen: number;
  habitatBuildLeft: number;
  hasOxygen: boolean;
  contained: boolean;
  flowerNearby: boolean;
  realLinked: boolean;
};
export type WildInsect = {
  id: string;
  species: "ladybug" | "grasshopper" | "butterfly" | "dragonfly";
  x: number;
  y: number;
};
export type EcoWorld = {
  farm: Farm;
  life: { hungerPct: number; insects: number; catchCooldown: number };
  entities: EcoEntity[];
  wildInsects: WildInsect[];
  inventory: Record<string, number>;
  catalog: EcoCatalog;
  labels: Record<string, string>;
  sellPrices: Record<string, number>;
  shopSupplies: Record<string, number>;
  history: {
    type: string;
    kind: string;
    quantity: number;
    coins: number;
    at: string;
  }[];
  grid: { width: number; height: number };
  serverTime: string;
};
export function sprite(kind: string) {
  const crops = ["rice_crop", "water_spinach", "mustard", "flower"];
  return `/knowledge-farm/sprites/${crops.includes(kind) ? kind : kind}.png`;
}
export function formatSecs(seconds: number) {
  const n = Math.max(0, Math.ceil(seconds));
  return n >= 60
    ? `${Math.floor(n / 60)}p ${String(n % 60).padStart(2, "0")}s`
    : `${n}s`;
}

// Water habitat footprint. Keep synchronized with domain.Footprint and its unit tests.
export const WATER_HABITAT = { width: 4, height: 2 } as const;
export const WATER_HABITAT_CAPACITY =
  WATER_HABITAT.width * WATER_HABITAT.height;

export function entityFootprint(kind: string) {
  return kind === "aquaponics"
    ? { width: 5, height: 3 }
    : ["pond", "tank"].includes(kind)
      ? WATER_HABITAT
      : { width: 1, height: 1 };
}
