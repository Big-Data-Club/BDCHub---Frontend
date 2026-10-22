import type { Dispatch, SetStateAction } from "react";
import type { EcoCatalogEntry, EcoEntity, EcoWorld } from "../lib/economy";
import { formatSecs } from "../lib/economy";
import type { Species } from "../types";
import { Pix, TABS, nextActionForSupply, stateText } from "./GamePresentation";
import type { Mode, Tab } from "./GamePresentation";
import SellControls from "./SellControls";
import { SpeciesGuide } from "./SpeciesGuide";

type Panel = "shop" | "bag" | "info";
type Props = {
  panel: Panel;
  setPanel: Dispatch<SetStateAction<Panel | null>>;
  tab: Tab;
  setTab: Dispatch<SetStateAction<Tab>>;
  world: EcoWorld;
  busy: boolean;
  hungry: boolean;
  mode: Mode;
  catalog: [string, EcoCatalogEntry][];
  stock: [string, number][];
  picked: EcoEntity | undefined;
  pickedCatalog: EcoCatalogEntry | undefined;
  info: Species | undefined;
  entities: EcoEntity[];
  farmName: string;
  setFarmName: Dispatch<SetStateAction<string>>;
  selectPlace: (kind: string) => void;
  submit: (path: string, body?: object) => Promise<boolean>;
  supplyAction: (kind: string) => void;
  inv: (kind: string) => number;
  canMill: boolean;
  canCook: boolean;
};

export function GameWindow({
  panel,
  setPanel,
  tab,
  setTab,
  world,
  busy,
  hungry,
  mode,
  catalog,
  stock,
  picked,
  pickedCatalog,
  info,
  entities,
  farmName,
  setFarmName,
  selectPlace,
  submit,
  supplyAction,
  inv,
  canMill,
  canCook,
}: Props) {
  return (
    <div className="eco-window-shade" onClick={() => setPanel(null)}>
      <section
        className={`eco-pixel-window${panel === "bag" ? " eco-pixel-window-bag" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={
          panel === "shop"
            ? "Cửa hàng"
            : panel === "bag"
              ? "Kho và bán hàng"
              : "Thông tin nông trại"
        }
        onClick={(event) => event.stopPropagation()}
      >
        <div className="eco-window-title">
          <strong>
            {panel === "shop"
              ? "✿ Cửa hàng"
              : panel === "bag"
                ? "▣ Kho & bán hàng"
                : "ⓘ Sổ tay nông trại"}
          </strong>
          <button
            type="button"
            aria-label="Đóng cửa sổ"
            onClick={() => setPanel(null)}
          >
            ✕
          </button>
        </div>
        <div className="eco-window-body">
          {panel === "shop" && (
            <>
              <div className="eco-category-tabs">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    className={tab === t.key ? "active" : ""}
                    onClick={() => setTab(t.key)}
                  >
                    <b>{t.symbol}</b>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
              <div className="eco-product-grid">
                {tab === "SUPPLY"
                  ? Object.entries(world.shopSupplies).map(([kind, price]) => (
                      <button
                        type="button"
                        className="eco-product"
                        disabled={busy || (hungry && kind !== "rice")}
                        key={kind}
                        onClick={() =>
                          void submit("/game/shop", { kind, quantity: 1 })
                        }
                        aria-label={`Mua ${world.labels[kind] || kind}, ${price} xu`}
                      >
                        <Pix kind={kind} size={43} />
                        <strong>{world.labels[kind] || kind}</strong>
                        <small>Đang có: {inv(kind)}</small>
                        <b>{price} xu</b>
                      </button>
                    ))
                  : catalog.map(([key, good]: [string, EcoCatalogEntry]) => (
                      <button
                        disabled={busy || hungry}
                        className={
                          "eco-product " +
                          (mode?.type === "place" && mode.kind === key
                            ? "chosen"
                            : "")
                        }
                        key={key}
                        onClick={() => selectPlace(key)}
                      >
                        <Pix kind={key} size={43} />
                        <strong>{good.label}</strong>
                        <small>
                          {good.category === "STRUCTURE"
                            ? "Xây " + formatSecs(good.seconds || 0)
                            : good.category === "CROP"
                              ? "Lớn " + formatSecs(good.seconds || 0)
                              : good.category === "ANIMAL"
                                ? "Nuôi & chăm sóc"
                                : "Trang trí"}
                        </small>
                        <b>{good.price} xu</b>
                      </button>
                    ))}
              </div>
            </>
          )}
          {panel === "bag" && (
            <>
              <div className="eco-inventory-grid">
                {stock.map(([kind, quantity]) => {
                  const supply = nextActionForSupply(kind, picked);
                  const canUse =
                    Boolean(supply) ||
                    ["meal", "rice", "aid_rice"].includes(kind);
                  const usedName =
                    kind === "meal"
                      ? "Ăn cơm"
                      : ["rice", "aid_rice"].includes(kind)
                        ? "Nấu cơm"
                        : kind === "oxygen"
                          ? "Bơm oxy"
                          : kind === "medicine"
                            ? "Chữa bệnh"
                            : "Cho ăn";
                  const price = world.sellPrices[kind] || 0;
                  return (
                    <div
                      className={
                        "eco-stock" + (price > 0 ? " eco-stock-sellable" : "")
                      }
                      key={kind}
                    >
                      <Pix kind={kind} size={42} />
                      <div className="eco-stock-info">
                        <strong>{world.labels[kind] || kind}</strong>
                        <small>Đang có: {quantity}</small>
                      </div>
                      {(canUse ||
                        [
                          "paddy",
                          "frog_feed",
                          "fish_feed",
                          "water_spinach",
                          "insect",
                          "medicine",
                          "oxygen",
                        ].includes(kind)) && (
                        <button
                          className="eco-use"
                          disabled={
                            busy ||
                            (hungry &&
                              !["meal", "rice", "aid_rice"].includes(kind))
                          }
                          onClick={() => supplyAction(kind)}
                        >
                          {usedName}
                        </button>
                      )}
                      {price > 0 && (
                        <SellControls
                          kind={kind}
                          label={world.labels[kind] || kind}
                          stock={quantity}
                          unitPrice={price}
                          disabled={busy || hungry}
                          onSell={(saleKind, saleQuantity) =>
                            submit("/game/sell", {
                              kind: saleKind,
                              quantity: saleQuantity,
                            })
                          }
                        />
                      )}
                    </div>
                  );
                })}
                {stock.length === 0 && (
                  <p>Kho đang trống. Hãy thu hoạch cây đầu tiên!</p>
                )}
              </div>
              <div className="eco-window-kitchen">
                <strong>🍳 Bếp nông trại</strong>
                <button
                  disabled={busy || !canMill}
                  onClick={() =>
                    void submit("/game/craft", {
                      recipe: "mill_rice",
                      quantity: 1,
                    })
                  }
                >
                  2 thóc → 1 gạo
                </button>
                <button
                  disabled={busy || !canCook}
                  onClick={() =>
                    void submit("/game/craft", {
                      recipe: "cook_meal",
                      quantity: 1,
                    })
                  }
                >
                  1 gạo → 1 cơm
                </button>
                <button
                  disabled={
                    busy || inv("meal") < 1 || world.life.hungerPct > 75
                  }
                  onClick={() => void submit("/game/eat")}
                >
                  Ăn cơm ({inv("meal")})
                </button>
              </div>
            </>
          )}
          {panel === "info" && (
            <>
              {picked && pickedCatalog && (
                <div className="eco-info-species">
                  <div className="eco-selected">
                    <Pix kind={picked.kind} size={48} />
                    <div>
                      <h3>{pickedCatalog.label}</h3>
                      <small>{stateText(picked)}</small>
                    </div>
                  </div>
                  {info && <SpeciesGuide species={info} />}
                </div>
              )}
              <div className="eco-info-grid">
                <section>
                  <h3>Điều khiển</h3>
                  <p>
                    Click để chọn · WASD để đi · phím 1–4 để chăm · 0 và mũi tên
                    để di chuyển · Del để gỡ.
                  </p>
                  <p>
                    Nhấn vào côn trùng trên bản đồ để bắt. Thu hoạch cần trả lời
                    một câu học tập.
                  </p>
                </section>
                <section>
                  <h3>Mục tiêu</h3>
                  {[
                    {
                      done:
                        entities.some((e) => e.kind === "rice_crop") ||
                        inv("paddy") > 3,
                      title: "Gieo lúa lấy thóc",
                    },
                    {
                      done: entities.some((e) => e.kind === "chicken"),
                      title: "Nuôi một con gà",
                    },
                    {
                      done: entities.some(
                        (e) => e.kind === "tank" || e.kind === "pond",
                      ),
                      title: "Xây ao hoặc thùng nuôi",
                    },
                    {
                      done:
                        entities.some((e) => e.kind === "hive") &&
                        entities.some((e) => e.kind === "flower"),
                      title: "Trồng hoa và nuôi ong",
                    },
                  ].map((mission, index) => (
                    <p key={index}>
                      {mission.done ? "✓" : "□"} {mission.title}
                    </p>
                  ))}
                </section>
              </div>
              <div className="eco-info-log">
                <h3>Hoạt động gần đây</h3>
                {world.history.slice(0, 4).map((event, index) => (
                  <p key={index}>
                    {world.labels[event.kind] ||
                      world.catalog[event.kind]?.label ||
                      event.kind}{" "}
                    · {event.coins > 0 ? "+" : ""}
                    {event.coins} xu
                  </p>
                ))}
              </div>
              <div className="eco-info-rename">
                <input
                  value={farmName}
                  maxLength={90}
                  aria-label="Tên nông trại"
                  onChange={(event) => setFarmName(event.target.value)}
                />
                <button
                  onClick={() => {
                    void submit("/game/rename", { name: farmName });
                    setPanel(null);
                  }}
                >
                  Đổi tên
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
