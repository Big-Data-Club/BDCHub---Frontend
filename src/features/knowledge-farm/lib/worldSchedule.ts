import type { CareTimers, EcoCatalog, EcoEntity, EcoWorld } from "./economy";

// Used only while an older farm-service replica is still serving responses.
const legacyCareTimers: CareTimers = {
  farmerHunger: 1800,
  animalHunger: 480,
  cropWater: 180,
};

// A visual estimate only. All actions still use the server's authoritative
// clock and production rules.
export function projectedProgress(
  entity: EcoEntity,
  catalog: EcoCatalog,
  elapsedSeconds: number,
  careTimers: CareTimers = legacyCareTimers,
): number {
  const duration = catalog[entity.kind]?.seconds;
  if (!duration || entity.ready > 0)
    return entity.ready > 0 ? 1 : entity.progress;
  if (entity.buildLeft > 0 || entity.sick) return entity.progress;

  let activeSeconds = Math.max(0, elapsedSeconds);
  let speed = 1;
  if (entity.category === "CROP") {
    if (entity.regrowLeft > 0 || entity.needsRewater) return entity.progress;
    if (entity.onAquaponics) {
      if (!entity.aquaActive) return entity.progress;
      speed = 1.2;
    } else {
      activeSeconds = Math.min(
        activeSeconds,
        (entity.waterPct * careTimers.cropWater) / 100,
      );
    }
  } else if (entity.category === "ANIMAL") {
    if (
      (["fish", "frog", "bee"].includes(entity.kind) && !entity.housed) ||
      (["fish", "frog"].includes(entity.kind) && !entity.hasOxygen) ||
      (entity.kind === "bee" && !entity.flowerNearby)
    )
      return entity.progress;
    activeSeconds = Math.min(
      activeSeconds,
      (entity.hungerPct * careTimers.animalHunger) / 100,
    );
  } else {
    return entity.progress;
  }
  return Math.min(1, entity.progress + (activeSeconds * speed) / duration);
}

// All durations originate from the last authoritative server snapshot. One
// timeout covers the closest possible state transition; no idle HTTP polling.
export function nextWorldRefreshDelay(world: EcoWorld): number | null {
  const careTimers = world.careTimers ?? legacyCareTimers;
  const due: number[] = [];
  const addSeconds = (seconds: number | undefined) => {
    if (seconds !== undefined && Number.isFinite(seconds) && seconds > 0) {
      due.push(seconds);
    }
  };

  addSeconds(world.life.nextInsectIn);
  addSeconds((world.life.hungerPct * careTimers.farmerHunger) / 100);

  for (const entity of world.entities) {
    addSeconds(entity.buildLeft);
    addSeconds(entity.regrowLeft);
    addSeconds(entity.oxygenLeft);

    if (entity.category === "CROP" && !entity.onAquaponics) {
      addSeconds((entity.waterPct * careTimers.cropWater) / 100);
    }
    if (entity.category === "ANIMAL") {
      addSeconds((entity.hungerPct * careTimers.animalHunger) / 100);
    }

    const duration = world.catalog[entity.kind]?.seconds;
    if (!duration || entity.ready || entity.buildLeft > 0 || entity.sick)
      continue;
    if (entity.category === "CROP") {
      if (entity.regrowLeft > 0 || entity.needsRewater) continue;
      if (entity.onAquaponics ? !entity.aquaActive : entity.waterPct === 0)
        continue;
      const remaining =
        ((1 - entity.progress) * duration) / (entity.onAquaponics ? 1.2 : 1);
      if (
        entity.onAquaponics ||
        remaining <= (entity.waterPct * careTimers.cropWater) / 100
      ) {
        addSeconds(remaining);
      }
    } else if (entity.category === "ANIMAL") {
      if (
        entity.hungerPct === 0 ||
        (["fish", "frog", "bee"].includes(entity.kind) && !entity.housed) ||
        (["fish", "frog"].includes(entity.kind) && !entity.hasOxygen) ||
        (entity.kind === "bee" && !entity.flowerNearby)
      )
        continue;
      const remaining = (1 - entity.progress) * duration;
      if (remaining <= (entity.hungerPct * careTimers.animalHunger) / 100)
        addSeconds(remaining);
    }
  }

  const serverTime = Date.parse(world.serverTime);
  if (Number.isFinite(serverTime)) {
    for (const insect of world.wildInsects) {
      if (insect.expiresAt) {
        addSeconds((Date.parse(insect.expiresAt) - serverTime) / 1000);
      }
    }
  }

  if (due.length === 0) return null;
  // Give PostgreSQL's integer-second simulation time to cross the boundary.
  // Browser timers can run late; visibilitychange reconciles after backgrounding.
  return Math.max(1500, Math.ceil(Math.min(...due) * 1000) + 1200);
}
