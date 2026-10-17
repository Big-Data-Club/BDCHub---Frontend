"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Check, X } from "lucide-react";
import { api, post } from "../lib/api";
import { entityFootprint } from "../lib/economy";
import { nextWorldRefreshDelay } from "../lib/worldSchedule";
import {
  getEntityShortcuts,
  nudgeMovePreview,
  shouldIgnoreFarmShortcut,
} from "../lib/farmShortcuts";
import type { FarmShortcut } from "../lib/farmShortcuts";
import type { EcoWorld } from "../lib/economy";
import type { Challenge, AnswerResult, Species, LearningMode } from "../types";
import { HarvestDialog } from "./HarvestDialog";
import { GameWindow } from "./GameWindow";
import { Pix, nextActionForSupply, stateText } from "./GamePresentation";
import type { Mode, Tab } from "./GamePresentation";
import "../game/eco.css";
type ViewProps = {
  flash: (message: string) => void;
  fail: (error: unknown) => void;
  clearError: () => void;
  catalogInfo: Species[];
  onReward: () => void;
  onRefresh: () => void;
  score: number | null;
  dailyEarned: number;
  dailyLimit: number;
  message: string;
  error: string;
};

const EcoGame = dynamic(() => import("../game/EcoGame"), { ssr: false });
export default function PlayerView({
  flash,
  fail,
  clearError,
  catalogInfo,
  onReward,
  onRefresh,
  score,
  dailyEarned,
  dailyLimit,
  message,
  error,
}: ViewProps) {
  const [learningMode, setLearningMode] = useState<LearningMode>("quiz");
  const [lesson, setLesson] = useState<{
    challenge: Challenge;
    entityId: string;
    action: string;
  } | null>(null);
  const [lessonError, setLessonError] = useState("");
  const [lessonResult, setLessonResult] = useState<AnswerResult | null>(null);
  const actionLock = useRef(false),
    requestVersion = useRef(0);
  const [world, setWorld] = useState<EcoWorld | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [movePreview, setMovePreview] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [tab, setTab] = useState<Tab>("CROP");
  const [panel, setPanel] = useState<"shop" | "bag" | "info" | null>(null);
  const [busy, setBusy] = useState(false);
  const [farmName, setFarmName] = useState("");
  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    const data = await api<EcoWorld>("/game/state");
    if (version !== requestVersion.current) return data;
    setWorld(data);
    clearError();
    setFarmName((prev) => prev || data.farm.name);
    return data;
  }, [clearError]);
  useEffect(() => {
    const versionRef = requestVersion;
    load().catch(fail);
    const onVisible = () => {
      if (!document.hidden && !actionLock.current) load().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      ++versionRef.current;
    };
  }, [load, fail]);
  useEffect(() => {
    if (!world || lesson) return;
    const delay = nextWorldRefreshDelay(world);
    if (delay === null) return;
    let active = true;
    let retries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const refreshAtDeadline = () => {
      if (document.hidden || actionLock.current) return;
      void load().catch(() => {
        if (active && retries++ < 3)
          timer = setTimeout(refreshAtDeadline, 15000 + Math.random() * 10000);
      });
    };
    // Spread a classroom's simultaneous crop deadlines across a short window.
    timer = setTimeout(refreshAtDeadline, delay + Math.random() * 2000);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [world, lesson, load]);
  const entities = world?.entities || [];
  const picked = entities.find((e) => e.id === selected);
  const pickedCatalog = picked && world?.catalog[picked.kind];
  const shortcuts = getEntityShortcuts(picked);
  const infoKind = picked?.kind;
  const info = catalogInfo.find((item) => item.kind === infoKind);
  const beginHarvest = async (name: string) => {
    if (!picked || actionLock.current) return;
    setPanel(null);
    actionLock.current = true;
    setBusy(true);
    ++requestVersion.current;
    setLessonError("");
    setLessonResult(null);
    try {
      const challenge = await post<Challenge>("/game/challenge", {
        entityId: picked.id,
        action: name,
        kind: learningMode,
      });
      setLesson({ challenge, entityId: picked.id, action: name });
    } catch (error) {
      fail(error);
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };
  const answerHarvest = async (answer: string) => {
    if (!lesson || actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    ++requestVersion.current;
    setLessonError("");
    try {
      const result = await post<AnswerResult>("/game/action", {
        entityId: lesson.entityId,
        action: lesson.action,
        challenge_id: lesson.challenge.id,
        answer,
      });
      if (result.correct) {
        setLesson(null);
        if (
          lesson.action === "SELL_CHICKEN" ||
          ["fish", "frog"].includes(picked?.kind || "")
        )
          setSelected(null);
        setWorld(
          (previous) =>
            previous && {
              ...previous,
              entities: previous.entities.map((entity) =>
                entity.id === lesson.entityId
                  ? { ...entity, ready: 0, progress: 0 }
                  : entity,
              ),
            },
        );
        flash(
          `Thu hoạch thành công! +${result.awarded} điểm. ${result.explanation}`,
        );
        onReward();
      } else {
        setLessonResult(result);
      }
      void load().catch(fail);
    } catch (error) {
      setLessonError(
        error instanceof Error
          ? error.message
          : "Không thể kiểm tra câu trả lời.",
      );
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };
  const catalog = useMemo(
    () =>
      Object.entries(world?.catalog || {}).filter(
        ([, v]) => v.category === tab,
      ),
    [world, tab],
  );
  const inv = (item: string) => world?.inventory[item] || 0;
  const submit = async (path: string, body: object = {}): Promise<boolean> => {
    if (actionLock.current) return false;
    actionLock.current = true;
    ++requestVersion.current;
    setBusy(true);
    try {
      const result = await post<{ message: string }>(path, body);
      flash(result.message);
      void load().catch(fail);
      return true;
    } catch (error) {
      fail(error);
      return false;
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };
  const catchInsect = async (insectId: string) => {
    if (actionLock.current) return;
    actionLock.current = true;
    ++requestVersion.current;
    setBusy(true);
    // Remove the insect immediately; the next authoritative state restores it if the catch fails.
    setWorld(
      (previous) =>
        previous && {
          ...previous,
          wildInsects: previous.wildInsects.filter(
            (insect) => insect.id !== insectId,
          ),
        },
    );
    try {
      const result = await post<{ message: string }>("/game/catch", {
        insectId,
      });
      flash(result.message);
    } catch (error) {
      fail(error);
    } finally {
      actionLock.current = false;
      setBusy(false);
      void load().catch(fail);
    }
  };
  const onTile = (x: number, y: number) => {
    if (!world || busy) return;
    if (world.life.hungerPct === 0 && mode) {
      flash("Nông dân cần ăn cơm để làm tiếp!");
      setMode(null);
      return;
    }
    if (mode?.type === "place") {
      void (async () => {
        if (await submit("/game/place", { kind: mode.kind, x, y }))
          setMode(null);
      })();
      return;
    }
    if (mode?.type === "move") {
      // Clicking a new location previews it, just like arrow keys. Enter commits.
      setMovePreview({ x, y });
      return;
    }
    const bug = world.wildInsects?.find((b) => b.x === x && b.y === y);
    if (bug) {
      if (world.life.hungerPct === 0) {
        flash("Nông dân cần ăn cơm để bắt côn trùng!");
        return;
      }
      void catchInsect(bug.id);
      return;
    }
    // A fish/frog belongs to its water tile: choose the animal before the habitat.
    const hit = entities.filter((e) => {
      const { width, height } = entityFootprint(e.kind);
      return x >= e.x && x < e.x + width && y >= e.y && y < e.y + height;
    });
    const target =
      hit.find((e) => e.category === "ANIMAL") ||
      hit.find((e) => e.category === "CROP") ||
      hit[hit.length - 1];
    setPanel(null);
    setSelected(target?.id || null);
  };
  const removeSelected = () => {
    if (!picked || busy) return;
    const label = world?.catalog[picked.kind]?.label || picked.kind;
    if (
      !window.confirm(
        `Gỡ ${label} khỏi nông trại?\nHoàn ${picked.refundCoins} Xu Lá.\nCây/con vật sẽ mất, nông sản đã thu hoạch trong kho vẫn giữ.`,
      )
    )
      return;
    void (async () => {
      if (await submit("/game/remove", { entityId: picked.id })) {
        setSelected(null);
        setMode(null);
        setMovePreview(null);
      }
    })();
  };
  const action = (name: string, item?: string) => {
    if (!picked) return;
    if (name === "HARVEST" || name === "SELL_CHICKEN") {
      void beginHarvest(name);
      return;
    }
    if (world?.life.hungerPct === 0) {
      flash("Nông dân cần ăn cơm để làm tiếp!");
      return;
    }
    void (async () => {
      if (
        await submit("/game/action", {
          entityId: picked.id,
          action: name,
          ...(item ? { item } : {}),
        })
      ) {
        if (
          name === "SELL_CHICKEN" ||
          (name === "HARVEST" && ["frog", "fish"].includes(picked.kind))
        )
          setSelected(null);
      }
    })();
  };
  const startMove = () => {
    if (!picked) {
      flash("Chọn một vật thể trước khi di chuyển.");
      return;
    }
    if (world?.life.hungerPct === 0) {
      flash("Nông dân cần ăn cơm để làm tiếp!");
      return;
    }
    if (busy) return;
    if (mode?.type !== "move" || mode.id !== picked.id)
      setMovePreview({ x: picked.x, y: picked.y });
    setMode({ type: "move", id: picked.id });
  };
  const confirmMove = () => {
    if (busy || mode?.type !== "move" || !movePreview) return;
    const { id } = mode;
    const { x, y } = movePreview;
    if (picked && picked.x === x && picked.y === y) {
      setMode(null);
      setMovePreview(null);
      return;
    }
    void (async () => {
      if (await submit("/game/move", { entityId: id, x, y })) {
        setMode(null);
        setMovePreview(null);
      }
    })();
  };
  const triggerShortcut = (shortcut: FarmShortcut) => {
    if (busy) return;
    if (world?.life.hungerPct === 0) {
      flash("Nông dân cần ăn cơm để làm tiếp!");
      return;
    }
    if (!shortcut.enabled) {
      flash(shortcut.reason || "Thao tác chưa khả dụng.");
      return;
    }
    if (shortcut.command === "OXYGEN_HABITAT") {
      if (picked?.habitatId)
        void submit("/game/action", {
          entityId: picked.habitatId,
          action: "OXYGEN",
        });
      return;
    }
    action(shortcut.command);
  };
  // Capture digits only while playing. Input fields (including SellControls), browser
  // shortcuts and text editors must behave normally. Do not move by API per arrow:
  // arrows only update the preview; Enter commits one authoritative Go transaction.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (panel) {
        if (event.key === "Escape") {
          event.preventDefault();
          setPanel(null);
        }
        return;
      }
      if (
        lesson ||
        shouldIgnoreFarmShortcut(
          event.target,
          event.ctrlKey,
          event.altKey,
          event.metaKey,
        )
      )
        return;
      const isArrow = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(event.key);
      if (mode?.type === "move" && isArrow) {
        event.preventDefault();
        if (busy || !picked) return;
        setMovePreview((previous) =>
          nudgeMovePreview(
            previous || { x: picked.x, y: picked.y },
            event.key as "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
            entityFootprint(picked.kind),
            world?.grid || { width: 20, height: 14 },
          ),
        );
        return;
      }
      if (event.repeat) return;
      if (event.key === "Escape") {
        if (mode || selected) {
          event.preventDefault();
          setMode(null);
          setMovePreview(null);
          if (!mode) setSelected(null);
        }
        return;
      }
      if (mode?.type === "move" && event.key === "Enter") {
        event.preventDefault();
        confirmMove();
        return;
      }
      if (event.key === "0" || event.code === "Numpad0") {
        event.preventDefault();
        startMove();
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && picked) {
        event.preventDefault();
        if (busy) return;
        removeSelected();
        return;
      }
      if (mode?.type === "move" || mode?.type === "place") return;
      const key = event.code.startsWith("Numpad")
        ? event.code.slice(6)
        : event.key;
      const match = shortcuts.find((shortcut) => shortcut.key === key);
      if (match) {
        event.preventDefault();
        triggerShortcut(match);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
  const selectPlace = (kind: string) => {
    if (world?.life.hungerPct === 0) {
      flash("Nông dân cần ăn cơm để làm tiếp!");
      return;
    }
    setMode({ type: "place", kind });
    setMovePreview(null);
    setSelected(null);
    setPanel(null);
  };
  const supplyAction = (kind: string) => {
    if (kind === "meal") {
      void submit("/game/eat");
      return;
    }
    if (kind === "rice" || kind === "aid_rice") {
      void submit("/game/craft", { recipe: "cook_meal", quantity: 1 });
      return;
    }
    // Players may pump their frog/fish habitat directly without searching for
    // an empty water tile to select underneath the animals.
    if (
      kind === "oxygen" &&
      picked &&
      ["fish", "frog"].includes(picked.kind) &&
      picked.habitatId
    ) {
      void submit("/game/action", {
        entityId: picked.habitatId,
        action: "OXYGEN",
      });
      return;
    }
    const actionInfo = nextActionForSupply(kind, picked);
    if (actionInfo) {
      action(actionInfo.action, actionInfo.item);
      return;
    }
    const hints: Record<string, string> = {
      paddy: "Chọn một con gà trên bản đồ trước nhé!",
      insect: "Chọn ếch để cho ăn.",
      frog_feed: "Chọn ếch để cho ăn.",
      water_spinach: "Chọn cá để cho ăn.",
      fish_feed: "Chọn cá để cho ăn.",
      oxygen: "Chọn ao, thùng hoặc giàn aquaponics.",
      medicine: "Chọn vật nuôi bị bệnh.",
    };
    flash(hints[kind] || "Vật phẩm này dùng để bán hoặc chế biến.");
  };
  if (!world)
    return (
      <div className="eco-loader">
        <span className="eco-pixel-loader">🌱</span>
        <h2>Đang mở khu vườn...</h2>
        {error && (
          <p role="alert">
            {error}{" "}
            <button onClick={() => void load().catch(fail)}>Thử lại</button>
          </p>
        )}
      </div>
    );
  const harvestable = entities.filter((e) => e.ready > 0).length;
  const needCare = entities.filter(
    (e) => e.category === "ANIMAL" && (e.hungerPct === 0 || e.sick),
  ).length;
  const stock = Object.entries(world.inventory)
    .filter(([, amount]) => amount > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  const hungry = world.life.hungerPct === 0;
  const canMill = inv("paddy") >= 2;
  const canCook = inv("rice") + inv("aid_rice") > 0;
  const recover = () => {
    if (inv("meal") > 0) {
      void submit("/game/eat");
      return;
    }
    if (canCook) {
      void submit("/game/craft", { recipe: "cook_meal", quantity: 1 });
      return;
    }
    if (canMill) {
      void submit("/game/craft", { recipe: "mill_rice", quantity: 1 });
      return;
    }
    if (world.farm.coins >= world.shopSupplies.rice) {
      void submit("/game/shop", { kind: "rice", quantity: 1 });
      return;
    }
    if (hungry) {
      void submit("/game/aid");
    } else flash("Hãy trồng thêm lúa hoặc mua gạo để dự trữ nhé!");
  };
  const recoverLabel =
    inv("meal") > 0
      ? "Ăn cơm"
      : canCook
        ? "Nấu cơm"
        : canMill
          ? "Xay gạo"
          : world.farm.coins >= world.shopSupplies.rice
            ? "Mua gạo"
            : hungry
              ? "Xin gạo cứu trợ"
              : "Hết gạo";

  return (
    <div className="eco eco-v4 eco-v5">
      <header className="eco-play-heading">
        <div className="eco-play-title">
          <span aria-hidden="true">✿</span>
          <div>
            <small>NÔNG TRẠI KIẾN THỨC</small>
            <h1>{world.farm.name}</h1>
          </div>
        </div>
        <label className="eco-learning-select">
          Thu hoạch bằng{" "}
          <select
            aria-label="Cách học khi thu hoạch"
            value={learningMode}
            disabled={busy || !!lesson}
            onChange={(event) =>
              setLearningMode(event.target.value as LearningMode)
            }
          >
            <option value="quiz">Quiz</option>
            <option value="flashcard">Flashcard</option>
          </select>
        </label>
      </header>
      <main className="eco-play-frame">
        <EcoGame
          entities={entities}
          catalog={world.catalog}
          selected={selected}
          mode={mode}
          movePreview={mode?.type === "move" ? movePreview : null}
          insects={world.wildInsects || []}
          serverTime={world.serverTime}
          onTile={onTile}
          disabled={busy || !!lesson}
        />
        <div className="eco-play-hud" aria-label="Trạng thái nông trại">
          <span>
            ⭐ Cấp {world.farm.level} · {world.farm.xp} XP
          </span>
          <span>🪙 {world.farm.coins} xu</span>
          <span>
            📘 {score ?? "—"} điểm · {dailyEarned}/{dailyLimit} hôm nay
          </span>
          <span className={hungry ? "eco-urgent" : ""}>
            🍚 {world.life.hungerPct}%
          </span>
          <span>🌾 {harvestable} sẵn sàng</span>
          {needCare > 0 && (
            <span className="eco-urgent">❤️ {needCare} cần chăm</span>
          )}
        </div>
        {message && (
          <div className="eco-play-notice" role="status">
            {message}
          </div>
        )}
        {error && (
          <div className="eco-play-notice eco-play-error" role="alert">
            {error}{" "}
            <button onClick={() => window.location.reload()}>Tải lại</button>
          </div>
        )}
        {mode && (
          <div className="eco-build-hint">
            <span>
              {mode.type === "place"
                ? "Chọn ô để đặt " +
                  (world.catalog[mode.kind]?.label || mode.kind)
                : "Di chuyển đến ô " +
                  (movePreview
                    ? "(" +
                      (movePreview.x + 1) +
                      ", " +
                      (movePreview.y + 1) +
                      ")"
                    : "")}
            </span>
            {mode.type === "move" && (
              <button
                className="eco-confirm-move"
                disabled={busy}
                onClick={confirmMove}
              >
                <Check size={16} /> Đặt
              </button>
            )}
            <button
              onClick={() => {
                setMode(null);
                setMovePreview(null);
              }}
            >
              <X size={16} /> Hủy
            </button>
          </div>
        )}
        {picked && pickedCatalog && !panel && !mode && (
          <aside className="eco-context-panel" aria-label="Vật thể đã chọn">
            <div className="eco-context-title">
              <Pix kind={picked.kind} size={43} />
              <div>
                <h2>{pickedCatalog.label}</h2>
                <small>{stateText(picked)}</small>
              </div>
              <button
                type="button"
                aria-label="Bỏ chọn"
                onClick={() => setSelected(null)}
              >
                <X size={17} />
              </button>
            </div>
            {["CROP", "ANIMAL"].includes(picked.category) && (
              <div className="eco-context-progress">
                <i style={{ width: picked.progress * 100 + "%" }} />
              </div>
            )}
            <div className="eco-shortcuts-actions">
              {shortcuts.map((shortcut) => (
                <button
                  key={shortcut.key}
                  type="button"
                  disabled={
                    busy || hungry || !shortcut.enabled || Boolean(mode)
                  }
                  title={shortcut.reason}
                  onClick={() => triggerShortcut(shortcut)}
                >
                  <kbd>{shortcut.key}</kbd>
                  {shortcut.label}
                </button>
              ))}
              <button
                type="button"
                disabled={busy || hungry}
                onClick={startMove}
              >
                <kbd>0</kbd>Di chuyển
              </button>
              <button
                type="button"
                disabled={busy || hungry}
                onClick={removeSelected}
              >
                <kbd>Del</kbd>Gỡ
              </button>
            </div>
            <button
              className="eco-context-info"
              type="button"
              onClick={() => setPanel("info")}
            >
              ⓘ Thông tin & cách chăm
            </button>
          </aside>
        )}
        {panel && (
          <GameWindow
            panel={panel}
            setPanel={setPanel}
            tab={tab}
            setTab={setTab}
            world={world}
            busy={busy}
            hungry={hungry}
            mode={mode}
            catalog={catalog}
            stock={stock}
            picked={picked}
            pickedCatalog={pickedCatalog}
            info={info}
            entities={entities}
            farmName={farmName}
            setFarmName={setFarmName}
            selectPlace={selectPlace}
            submit={submit}
            supplyAction={supplyAction}
            inv={inv}
            canMill={canMill}
            canCook={canCook}
          />
        )}
        <nav className="eco-play-dock" aria-label="Công cụ nông trại">
          <button
            type="button"
            className={panel === "shop" ? "active" : ""}
            onClick={() =>
              setPanel((value) => (value === "shop" ? null : "shop"))
            }
          >
            🌱 <span>Trồng & xây</span>
          </button>
          <button
            type="button"
            className={panel === "bag" ? "active" : ""}
            onClick={() =>
              setPanel((value) => (value === "bag" ? null : "bag"))
            }
          >
            🎒 <span>Kho & bán</span>
          </button>
          <button type="button" disabled={busy} onClick={recover}>
            🍚 <span>{recoverLabel}</span>
          </button>
          <button
            type="button"
            className={panel === "info" ? "active" : ""}
            aria-label="Thông tin nông trại"
            onClick={() =>
              setPanel((value) => (value === "info" ? null : "info"))
            }
          >
            ⓘ <span>Thông tin</span>
          </button>
          <button
            type="button"
            aria-label="Làm mới nông trại"
            onClick={() => {
              void load().catch(fail);
              onRefresh();
            }}
          >
            ↻ <span>Làm mới</span>
          </button>
        </nav>
      </main>
      {lesson && (
        <HarvestDialog
          key={lesson.challenge.id}
          challenge={lesson.challenge}
          open
          onClose={() => {
            if (!busy) {
              setLesson(null);
              setLessonResult(null);
              void load().catch(fail);
            }
          }}
          onAnswer={(answer) => void answerHarvest(answer)}
          busy={busy}
          error={lessonError}
          result={lessonResult}
        />
      )}
    </div>
  );
}
