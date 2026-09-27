import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMining } from "./useMining";
import { useWalletBalance } from "./useWallet";

var RARITY_LABELS = { epic: "Epic", mythic: "Mythic", legendary: "Legendary" };
var PERK_LABELS = {
  efficient: "Efficient", overclocked: "Overclocked", coldroom: "Cold Room",
  turbo: "Turbo", stable: "Stable", silent: "Silent"
};
var BUFF_LABELS = {
  no_sleep: "No Sleep", profit_boost: "Profit Booster",
  power_boost: "Power Overclock", power_boost_eff: "Efficient Overclock"
};
var BUFF_DESCRIPTIONS = {
  no_sleep: "All your servers stay awake for the entire duration.",
  profit_boost: "x2 profit on all servers, energy drain unchanged.",
  power_boost: "x2 power and profit, but x2 energy drain. Cheaper.",
  power_boost_eff: "x2 power and profit, energy drain reduced by 50%."
};
var DURATION_LABELS = { "24h": "24 Hours", "3d": "3 Days", "7d": "7 Days" };
var ENERGY_PACK_LABELS = { small: "Small Pack", medium: "Medium Pack", large: "Large Pack" };

function ChevronLeft() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
}
function WalletChipIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><path d="M16 12h.01"></path></svg>);
}
function CloseIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
}

function formatMoney(v) { return "$" + (v || 0).toFixed(2); }

const MiningShop = () => {
  const navigate = useNavigate();
  var mining = useMining();
  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var state = mining.state;

  var [shopTab, setShopTab] = useState("servers");
  var [shopModal, setShopModal] = useState(null); // { kind: "buff"|"pack"|"simple", ... }
  var [busy, setBusy] = useState(false);
  var [toast, setToast] = useState(null);
  var toastTimerRef = useRef(null);

  useEffect(function () {
    return function () { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  function showToast(ok, text) {
    setToast({ ok: ok, text: text });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(function () { setToast(null); }, 3200);
  }

  function runAction(promiseFn, successText) {
    if (busy) return;
    setBusy(true);
    promiseFn().then(function () {
      showToast(true, successText);
      refreshWallet();
    }).catch(function (err) {
      showToast(false, err.message || "Error");
    }).finally(function () {
      setBusy(false);
    });
  }

  if (!state) {
    return <div className="mng-page"></div>;
  }

  return (
    <div className="mng-page">
      <div className="mng-topbar">
        <button className="mng-icon-btn" onClick={() => navigate(-1)}><ChevronLeft /></button>
        <span className="mng-title">Mining Shop</span>
        <div className="mng-balance-chip">
          <WalletChipIcon />
          <span>{"$" + (wallet.balance || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="mng-shop-tabs">
        <button className={"mng-shop-tab" + (shopTab === "servers" ? " active" : "")} onClick={() => setShopTab("servers")}>Servers</button>
        <button className={"mng-shop-tab" + (shopTab === "items" ? " active" : "")} onClick={() => setShopTab("items")}>Boosts</button>
        <button className={"mng-shop-tab" + (shopTab === "energy" ? " active" : "")} onClick={() => setShopTab("energy")}>Energy</button>
      </div>

      {shopTab === "servers" && (
        <ServerShopTab
          shopServers={state.shopServers}
          busy={busy}
          onBuy={(catalogId) => runAction(() => mining.buyServer(catalogId), "Server purchased")}
        />
      )}
      {shopTab === "items" && (
        <ItemsShopTab shopItems={state.shopItems} onOpen={setShopModal} />
      )}
      {shopTab === "energy" && (
        <EnergyShopTab shopItems={state.shopItems} onOpen={setShopModal} />
      )}

      {toast && <div className={"mng-toast " + (toast.ok ? "ok" : "err")}>{toast.text}</div>}

      {shopModal && (
        <ShopBuyModal
          modal={shopModal}
          busy={busy}
          onClose={() => setShopModal(null)}
          onBuy={(itemType, key) => {
            runAction(() => mining.buyItem(itemType, key), "Purchase complete");
            setShopModal(null);
          }}
        />
      )}
    </div>
  );
};

// ===================== СЕРВЕРЫ: от дешёвого к дорогому =====================

function ServerShopTab(props) {
  // Сортировка по цене по возрастанию — от дешёвого к дорогому.
  var sorted = (props.shopServers || []).slice().sort(function (a, b) { return a.price - b.price; });

  return (
    <div className="mng-shop-list">
      {sorted.map(function (s) {
        return (
          <div key={s.catalogId} className="mng-shop-card">
            <div className="mng-shop-card-head">
              <div className="mng-shop-card-id">
                <span className="mng-shop-card-name">{s.name}</span>
                <span className={"mng-rarity-chip " + s.rarity}>{RARITY_LABELS[s.rarity] || s.rarity}</span>
              </div>
              <span className="mng-shop-card-country">{s.country}</span>
            </div>
            <div className="mng-shop-card-stats">
              <span>{"Power " + Math.round(s.power).toLocaleString("en-US")}</span>
              <span>{"Profit " + formatMoney(s.profitPerHour) + "/h · " + formatMoney(s.profitPerDay) + "/day"}</span>
              <span>{"Energy " + s.energyPerHour.toFixed(0) + "/h"}</span>
              <span>{s.alwaysOn ? "Never sleeps" : "Sleeps after " + s.sleepMinutes + " min"}</span>
              <span>{"Lifetime profit up to " + formatMoney(s.lifetimeCap)}</span>
            </div>
            {s.perks && s.perks.length > 0 && (
              <div className="mng-perk-chips">
                {s.perks.map(function (p) {
                  return <span key={p} className="mng-perk-chip">{PERK_LABELS[p] || p}</span>;
                })}
              </div>
            )}
            <div className="mng-shop-card-foot">
              <span className="mng-shop-card-owned">{"Owned: " + s.ownedCount}</span>
              <button
                className="mng-buy-btn"
                disabled={props.busy || !s.canBuy}
                onClick={() => props.onBuy(s.catalogId)}
              >
                {formatMoney(s.price)}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===================== БАФФЫ =====================

function ItemsShopTab(props) {
  var buffs = (props.shopItems && props.shopItems.buffs) || {};
  var order = ["profit_boost", "power_boost", "power_boost_eff", "no_sleep"];
  return (
    <div className="mng-item-list">
      {order.map(function (type) {
        var durations = buffs[type];
        if (!durations) return null;
        var minPrice = durations.reduce(function (m, d) { return Math.min(m, d.price); }, Infinity);
        return (
          <div key={type} className="mng-item-card" onClick={() => props.onOpen({ kind: "buff", itemType: type, durations: durations })}>
            <span className="mng-item-name">{BUFF_LABELS[type]}</span>
            <span className="mng-item-desc">{BUFF_DESCRIPTIONS[type]}</span>
            <span className="mng-item-price">{"from " + formatMoney(minPrice)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ===================== ЭНЕРГИЯ =====================

function EnergyShopTab(props) {
  var items = props.shopItems || {};
  var packs = items.energyPacks || [];
  var maxEnergyExpander = items.maxEnergyExpander;
  var slotExpander = items.slotExpander;
  return (
    <div className="mng-item-list">
      {packs.map(function (p) {
        return (
          <div key={p.id} className="mng-item-card" onClick={() => props.onOpen({ kind: "pack", itemType: "energy_pack", packId: p.id, amount: p.amount, price: p.price, title: ENERGY_PACK_LABELS[p.id] || p.id })}>
            <span className="mng-item-name">{ENERGY_PACK_LABELS[p.id] || p.id}</span>
            <span className="mng-item-desc">{"+" + Math.round(p.amount) + " energy instantly"}</span>
            <span className="mng-item-price">{formatMoney(p.price)}</span>
          </div>
        );
      })}
      {maxEnergyExpander && (
        <div className="mng-item-card" onClick={() => props.onOpen({ kind: "simple", itemType: "max_energy_expander", amount: maxEnergyExpander.amount, price: maxEnergyExpander.price, title: "Max Energy Expander", desc: "Permanently increases max energy by " + Math.round(maxEnergyExpander.amount) + "." })}>
          <span className="mng-item-name">Max Energy Expander</span>
          <span className="mng-item-desc">{"+" + Math.round(maxEnergyExpander.amount) + " max energy, forever"}</span>
          <span className="mng-item-price">{formatMoney(maxEnergyExpander.price)}</span>
        </div>
      )}
      {slotExpander && (
        <div className="mng-item-card" onClick={() => props.onOpen({ kind: "simple", itemType: "slot_expander", amount: slotExpander.amount, price: slotExpander.price, title: "Slot Expander", desc: "Permanently increases the server limit by " + Math.round(slotExpander.amount) + "." })}>
          <span className="mng-item-name">Slot Expander</span>
          <span className="mng-item-desc">{"+" + Math.round(slotExpander.amount) + " server slots, forever"}</span>
          <span className="mng-item-price">{formatMoney(slotExpander.price)}</span>
        </div>
      )}
    </div>
  );
}

// ===================== МОДАЛКА: ПОКУПКА =====================

function ShopBuyModal(props) {
  var m = props.modal;
  var [durationKey, setDurationKey] = useState(m.kind === "buff" ? m.durations[0].key : null);

  if (m.kind === "buff") {
    var selected = m.durations.filter(function (d) { return d.key === durationKey; })[0] || m.durations[0];
    return (
      <div className="mng-modal-overlay" onClick={props.onClose}>
        <div className="mng-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="mng-modal-head">
            <span className="mng-modal-title">{BUFF_LABELS[m.itemType]}</span>
            <button className="mng-modal-close" onClick={props.onClose}><CloseIcon /></button>
          </div>
          <span className="mng-modal-sub">{BUFF_DESCRIPTIONS[m.itemType]}</span>
          <div className="mng-duration-row">
            {m.durations.map(function (d) {
              return (
                <button key={d.key} className={"mng-duration-btn" + (d.key === selected.key ? " active" : "")} onClick={() => setDurationKey(d.key)}>
                  <span>{DURATION_LABELS[d.key] || d.key}</span>
                  <span className="mng-duration-price">{formatMoney(d.price)}</span>
                </button>
              );
            })}
          </div>
          <button className="mng-modal-primary-btn wide" disabled={props.busy} onClick={() => props.onBuy(m.itemType, selected.key)}>
            {"Buy · " + formatMoney(selected.price)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mng-modal-overlay" onClick={props.onClose}>
      <div className="mng-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="mng-modal-head">
          <span className="mng-modal-title">{m.title}</span>
          <button className="mng-modal-close" onClick={props.onClose}><CloseIcon /></button>
        </div>
        <span className="mng-modal-sub">{m.desc || ("+" + Math.round(m.amount) + " energy")}</span>
        <button className="mng-modal-primary-btn wide" disabled={props.busy} onClick={() => props.onBuy(m.itemType, m.packId)}>
          {"Buy · " + formatMoney(m.price)}
        </button>
      </div>
    </div>
  );
}

export default MiningShop;