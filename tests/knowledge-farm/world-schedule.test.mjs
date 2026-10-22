import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(
  new URL(
    "../../src/features/knowledge-farm/lib/worldSchedule.ts",
    import.meta.url,
  ),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { nextWorldRefreshDelay, projectedProgress } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

const world = () => ({
  serverTime: "2026-01-01T00:00:00Z",
  life: { hungerPct: 0, insects: 0, nextInsectIn: 0, catchCooldown: 0 },
  entities: [],
  wildInsects: [],
  catalog: { rice_crop: { seconds: 120 } },
});
const crop = () => ({
  kind: "rice_crop",
  category: "CROP",
  progress: 0,
  ready: 0,
  buildLeft: 0,
  regrowLeft: 0,
  oxygenLeft: 0,
  waterPct: 0,
  sick: false,
  onAquaponics: false,
  needsRewater: false,
});

test("a dormant farm makes no background HTTP request", () => {
  assert.equal(nextWorldRefreshDelay(world()), null);
  const dry = world();
  dry.entities.push(crop());
  assert.equal(nextWorldRefreshDelay(dry), null);
});

test("one deadline tracks the next crop, insect spawn or expiry", () => {
  const growing = world();
  growing.entities.push({ ...crop(), waterPct: 100 });
  assert.equal(nextWorldRefreshDelay(growing), 121200);

  growing.life.nextInsectIn = 30;
  assert.equal(nextWorldRefreshDelay(growing), 31200);

  growing.life.nextInsectIn = 0;
  growing.wildInsects.push({ expiresAt: "2026-01-01T00:00:40Z" });
  assert.equal(nextWorldRefreshDelay(growing), 41200);
});

test("a resting crop refreshes when it can be watered again", () => {
  const resting = world();
  resting.entities.push({ ...crop(), regrowLeft: 40, needsRewater: true });
  assert.equal(nextWorldRefreshDelay(resting), 41200);
});

test("local animation stops at water limits and does not freeze chickens", () => {
  const drySoon = { ...crop(), waterPct: 10 };
  assert.equal(projectedProgress(drySoon, world().catalog, 100), 0.15);

  const chicken = {
    ...crop(),
    kind: "chicken",
    category: "ANIMAL",
    housed: false,
    hasOxygen: false,
    hungerPct: 100,
  };
  assert.equal(
    projectedProgress(chicken, { chicken: { seconds: 360 } }, 180),
    0.5,
  );
});

test("server care timers control projections and the next refresh", () => {
  const relaxed = world();
  relaxed.careTimers = {
    farmerHunger: 43200,
    animalHunger: 43200,
    cropWater: 43200,
  };
  relaxed.life.hungerPct = 100;
  assert.equal(nextWorldRefreshDelay(relaxed), 43201200);
  assert.ok(
    Math.abs(
      projectedProgress(
        { ...crop(), waterPct: 0.1 },
        relaxed.catalog,
        100,
        relaxed.careTimers,
      ) - 0.36,
    ) < 1e-9,
  );
});
