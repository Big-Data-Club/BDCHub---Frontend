const screens = [
  "home",
  "rooms",
  "picker",
  "scan",
  "qr",
  "shifts",
  "activity",
  "profile",
  "register",
  "success",
  "org",
  "station",
] as const;
export type DemoScreen = (typeof screens)[number];
export type DemoCommand =
  | "hello"
  | "home"
  | "rooms"
  | "scan"
  | "qr"
  | "shifts"
  | "reset"
  | "offline";
type DemoMessage =
  | { type: "dutylog:ready" }
  | { type: "dutylog:screen"; screen: DemoScreen };

export function parseDemoMessage(value: unknown): DemoMessage | null {
  if (!value || typeof value !== "object" || !("type" in value)) return null;
  if (value.type === "dutylog:ready") return { type: "dutylog:ready" };
  if (
    value.type === "dutylog:screen" &&
    "screen" in value &&
    screens.some((screen) => screen === value.screen)
  ) {
    return { type: "dutylog:screen", screen: value.screen as DemoScreen };
  }
  return null;
}
