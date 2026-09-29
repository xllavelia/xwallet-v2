import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEmpire } from "./useEmpire";
import { useWalletBalance } from "./useWallet";

// ===================== КОНСТАНТЫ =====================

var RARITY_COLORS = {
  common: "#8b94a3",
  uncommon: "#4da3ff",
  rare: "#b98cff",
  epic: "#ff9a4d",
  legendary: "#ffd94d"
};

var BOOSTER_DURATIONS = [1, 24, 72, 168];

var EVENT_LABELS = {
  purchase: "Purchase",
  sale: "Sale",
  upgrade: "Upgrade",
  hire: "Hire",
  research: "Research",
  asset_buy: "Asset buy",
  asset_sell: "Asset sell",
  contract: "Contract",
  booster: "Booster",
  prestige: "Prestige"
};

var TABS = [
  { id: "build", label: "Build" },
  { id: "research", label: "Research" },
  { id: "exchange", label: "Exchange" },
  { id: "contracts", label: "Contracts" },
  { id: "boosters", label: "Boosters" },
  { id: "analytics", label: "Analytics" }
];

// ===================== ИКОНКИ =====================

function ChevronLeftIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
}
function WalletChipIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><path d="M16 12h.01"></path></svg>);
}
function TrendUpIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>);
}
function BuildingIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="9" y1="6" x2="9.01" y2="6"></line><line x1="15" y1="6" x2="15.01" y2="6"></line><line x1="9" y1="10" x2="9.01" y2="10"></line><line x1="15" y1="10" x2="15.01" y2="10"></line><line x1="9" y1="14" x2="9.01" y2="14"></line><line x1="15" y1="14" x2="15.01" y2="14"></line><path d="M10 22v-4h4v4"></path></svg>);
}
function CloseIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
}
function ChartIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="20" x2="4" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="20" y1="20" x2="20" y2="14"></line></svg>);
}

// ===================== ФОРМАТТЕРЫ =====================

function formatMoney(v) {
  var sign = v < 0 ? "-" : "";
  return sign + "$" + Math.abs(v || 0).toFixed(2);
}
function formatBig(v) {
  var sign = v < 0 ? "-" : "";
  var a = Math.abs(v || 0);
  if (a >= 1e9) return sign + "$" + (a / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return sign + "$" + (a / 1e6).toFixed(2) + "M";
  if (a >= 1e4) return sign + "$" + (a / 1e3).toFixed(1) + "K";
  return sign + "$" + a.toFixed(2);
}
function formatInt(v) {
  return Math.round(v || 0).toLocaleString("en-US");
}
function formatHMS(totalSeconds) {
  var s = Math.max(0, Math.round(totalSeconds));
  var d = Math.floor(s / 86400); s -= d * 86400;
  var h = Math.floor(s / 3600); s -= h * 3600;
  var m = Math.floor(s / 60); s -= m * 60;
  if (d > 0) return d + "d " + h + "h";
  if (h > 0) return h + "h " + m + "m";
  if (m > 0) return m + "m " + s + "s";
  return s + "s";
}
function formatAgeHours(h) {
  if (h >= 48) return Math.floor(h / 24) + "d " + Math.round(h % 24) + "h";
  return Math.round(h) + "h";
}
function formatPayback(h) {
  if (!h || h <= 0 || !isFinite(h)) return "—";
  if (h >= 48) return (h / 24).toFixed(1) + "d";
  return Math.round(h) + "h";
}
function formatAgo(tsSec) {
  var s = Math.max(0, Math.round(Date.now() / 1000 - tsSec));
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}
function formatDurHours(h) {
  if (h < 24) return h + "h";
  if (h % 24 === 0) return (h / 24) + "d";
  return (h / 24).toFixed(1) + "d";
}

// ===================== ГЛАВНЫЙ КОМПОНЕНТ =====================

const Empire = () => {
  const navigate = useNavigate();
  var { refresh: refreshWallet } = useWalletBalance();
  var empire = useEmpire();
  var state = empire.state;

  var [nowTick, setNowTick] = useState(Date.now());
  var [tab, setTab] = useState("build");
  var [sectorFilter, setSectorFilter] = useState("all");
  var [passportId, setPassportId] = useState(null);
  var [confirmModal, setConfirmModal] = useState(null); // {kind, ...}
  var [tradeModal, setTradeModal] = useState(null); // {assetId, side}
  var [busy, setBusy] = useState(false);
  var [toast, setToast] = useState(null);
  var toastTimerRef = useRef(null);

  useEffect(function () {
    var iv = setInterval(function () { setNowTick(Date.now()); }, 1000);
    return function () { clearInterval(iv); };
  }, []);

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
    return (
      <div className="emp-page">
        {empire.error && (
          <div className="emp-error-box">
            <span>{empire.error}</span>
            <button className="emp-btn ghost" onClick={() => empire.refresh().catch(function () {})}>Retry</button>
          </div>
        )}
      </div>
    );
  }

  var config = state.config || {};
  var constants = config.constants || {};
  var profile = state.profile;
  var rates = state.rates;
  var sectors = config.sectors || [];
  var objects = state.objects || [];

  // Живой баланс: между поллингами начисляем net_per_hour по прошедшему времени.
  var elapsedH = (nowTick - empire.stateAtRef.current) / 3600000;
  var liveBalance = Math.max(0, state.balance + rates.net_per_hour * elapsedH);

  var filteredObjects = sectorFilter === "all"
    ? objects
    : objects.filter(function (o) { return o.sector === sectorFilter; });

  var passportObject = null;
  objects.forEach(function (o) { if (o.instance_id === passportId) passportObject = o; });

  var activeBoosters = Object.keys(state.boosters || {}).filter(function (k) {
    return state.boosters[k] * 1000 > nowTick;
  });

  return (
    <div className="emp-page">
      {/* ── Топбар ── */}
      <div className="emp-topbar">
        <span className="emp-title">Empire</span>
        <div className="emp-balance-chip">
          <WalletChipIcon />
          <span>{formatMoney(liveBalance)}</span>
        </div>
      </div>

      {/* ── Шапка: стоимость империи и ключевые цифры ── */}
      <div className="emp-hero">
        <div className="emp-hero-label">Total Empire Value</div>
        <div className="emp-hero-value">{formatBig(state.empire_value)}</div>
        <div className={"emp-hero-sub " + (rates.net_per_hour >= 0 ? "pos" : "neg")}>
          <TrendUpIcon />
          <span>{formatMoney(rates.net_per_hour) + "/h · " + formatMoney(rates.net_per_day) + "/day net"}</span>
        </div>
       
        <div className="emp-xp-row">
          <span className="emp-level-badge">{"Lv " + profile.level}</span>
          <div className="emp-xp-bar">
            <div className="emp-xp-fill" style={{ width: Math.min(100, (profile.xp / Math.max(1, profile.xp_for_next)) * 100) + "%" }}></div>
          </div>
          <span className="emp-xp-text">{formatInt(profile.xp) + " / " + formatInt(profile.xp_for_next)}</span>
        </div>
        <div className="emp-chip-row">
          <span className="emp-chip">{state.object_count + " facilities"}</span>
          <span className="emp-chip">{state.worker_count + " workers"}</span>
          <span className="emp-chip">{"RP " + formatInt(profile.rp)}</span>
          <span className="emp-chip">{"RP +" + (rates.rp_per_hour || 0).toFixed(1) + "/h"}</span>
          {profile.prestige_points > 0 && (
            <span className="emp-chip accent">
              {"PP " + profile.prestige_points + " (+" + Math.round((state.prestige.current_income_bonus || 0) * 100) + "% income)"}
            </span>
          )}
        </div>
        {/* <div className="emp-hero-hint">Income accrues offline up to {constants.offline_cap_hours || 8}h</div> */}
      </div>


      {/* ── Активные бустеры ── */}
      {activeBoosters.length > 0 && (
        <div className="emp-boosters-strip">
          {activeBoosters.map(function (k) {
            var remaining = state.boosters[k] - nowTick / 1000;
            var def = (config.boosters || []).filter(function (b) { return b.id === k; })[0];
            return (
              <div key={k} className="emp-booster-chip">
                <span className="emp-booster-chip-name">{def ? def.name : k}</span>
                <span className="emp-booster-chip-time">{formatHMS(remaining)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Престиж ── */}
      {state.prestige.available ? (
        <button className="emp-prestige-banner" onClick={() => setConfirmModal({ kind: "prestige" })}>
          <span className="emp-prestige-banner-title">Prestige ready</span>
          <span className="emp-prestige-banner-sub">{"+" + state.prestige.pp_gain + " PP → permanent +" + Math.round(state.prestige.income_bonus_per_pp * 100) + "% income each"}</span>
        </button>
      ) : (
        profile.prestige_count > 0 && (
          <div className="emp-prestige-passive">
            {"Prestige " + profile.prestige_count + " · PP " + profile.prestige_points + " · +" + Math.round((state.prestige.current_income_bonus || 0) * 100) + "% income"}
          </div>
        )
      )}

      {/* ── Карта секторов ── */}
      <div className="emp-section">
        <div className="emp-section-head"><span className="emp-section-title">Sectors</span></div>
          <div className="emp-sector-grid">
  {sectors.map(function (s, index) {
    var st = (state.analytics.per_sector || {})[s.ID] || { count: 0, income_per_hour: 0, value: 0 };

    return (
      <button
        key={s.ID}
        className={
          "emp-sector-card" +
          (sectorFilter === s.ID ? " active" : "") +
          (index === sectors.length - 1 ? " emp-sector-card-last" : "")
        }
        onClick={() => setSectorFilter(sectorFilter === s.ID ? "all" : s.ID)}
      >
        <span className="emp-sector-dot" style={{ background: s.Color }}></span>
        <span className="emp-sector-name">{s.Name}</span>
        <span className="emp-sector-meta">
          {st.count + " obj · " + formatMoney(st.income_per_hour) + "/h"}
        </span>
      </button>
    );
  })}
</div>
      </div>

      {/* ── Мои объекты ── */}
      <div className="emp-section">
        <div className="emp-section-head">
          <span className="emp-section-title">My Facilities</span>
          <span className="emp-section-count">{filteredObjects.length + " / " + objects.length}</span>
        </div>
        {objects.length === 0 ? (
          <div className="emp-empty-card">
            <BuildingIcon />
            <span>No facilities yet — build your first one in the Build tab</span>
          </div>
        ) : (
          <div className="emp-object-list">
            {filteredObjects.map(function (o) {
              var sec = sectors.filter(function (s) { return s.ID === o.sector; })[0];
              return (
                <div key={o.instance_id} className="emp-object-row" onClick={() => setPassportId(o.instance_id)}>
                  <span className="emp-rarity-dot" style={{ background: RARITY_COLORS[o.rarity] || RARITY_COLORS.common }}></span>
                  <div className="emp-object-main">
                    <span className="emp-object-name">{o.name}</span>
                    <span className="emp-object-meta">
                      {(sec ? sec.Name : o.sector) + " · Lv " + o.level + (o.workers_hired > 0 ? " · " + o.workers_hired + "w" : "")}
                    </span>
                  </div>
                  <div className="emp-object-stats">
                    <span className={"emp-object-net " + (o.net_per_hour >= 0 ? "pos" : "neg")}>{formatMoney(o.net_per_hour) + "/h"}</span>
                    <span className="emp-object-value">{formatBig(o.current_value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Табы ── */}
      <div className="emp-tabs">
        {TABS.map(function (t) {
          return (
            <button key={t.id} className={"emp-tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "build" && (
        <BuildTab config={config} profile={profile} liveBalance={liveBalance} busy={busy}
          onBuy={(defId) => runAction(() => empire.act("buy_object", { def_id: defId }), "Facility purchased")} />
      )}
      {tab === "research" && (
        <ResearchTab state={state} busy={busy}
          onBuy={(dir) => runAction(() => empire.act("buy_research", { direction: dir }), "Research upgraded")} />
      )}
      {tab === "exchange" && (
        <ExchangeTab state={state} busy={busy} nowTick={nowTick} liveBalance={liveBalance}
          onOpen={(assetId, side) => setTradeModal({ assetId: assetId, side: side })} />
      )}
      {tab === "contracts" && (
        <ContractsTab state={state} busy={busy} nowTick={nowTick}
          onClaim={(id) => runAction(() => empire.act("claim_contract", { contract_id: id }), "Contract reward claimed")} />
      )}
      {tab === "boosters" && (
        <BoostersTab state={state} busy={busy} nowTick={nowTick}
          onBuy={(type, hours) => runAction(() => empire.act("buy_booster", { booster_type: type, duration_hours: hours }), "Booster activated")} />
      )}
      {tab === "analytics" && <AnalyticsTab state={state} />}

      {toast && <div className={"emp-toast " + (toast.ok ? "ok" : "err")}>{toast.text}</div>}

      {passportObject && (
        <PassportModal
          object={passportObject}
          config={config}
          busy={busy}
          onClose={() => setPassportId(null)}
          onUpgrade={() => runAction(() => empire.act("upgrade_object", { object_id: passportObject.instance_id }), "Facility upgraded")}
          onSell={() => setConfirmModal({ kind: "sell", object: passportObject })}
          onHire={() => runAction(() => empire.act("hire_worker", { object_id: passportObject.instance_id }), "Worker hired")}
          onRename={(name) => runAction(() => empire.act("rename_object", { object_id: passportObject.instance_id, name: name }), "Facility renamed")}
        />
      )}

      {confirmModal && confirmModal.kind === "sell" && (
        <ConfirmModal
          title={"Sell " + confirmModal.object.name + "?"}
          lines={[
            "You will receive " + formatMoney(confirmModal.object.sell_value) + " (" + Math.round((constants.sell_back_rate || 0.65) * 100) + "% of invested " + formatMoney(confirmModal.object.invested) + ").",
            "Lifetime earned: " + formatMoney(confirmModal.object.lifetime_earned) + ". This cannot be undone."
          ]}
          confirmLabel="Sell"
          danger={true}
          busy={busy}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            var id = confirmModal.object.instance_id;
            setConfirmModal(null);
            setPassportId(null);
            runAction(() => empire.act("sell_object", { object_id: id }), "Facility sold");
          }}
        />
      )}

      {confirmModal && confirmModal.kind === "prestige" && (
        <ConfirmModal
          title={"Prestige for +" + state.prestige.pp_gain + " PP?"}
          lines={[
            "Permanent bonus: +" + Math.round(state.prestige.income_bonus_per_pp * 100) + "% income per PP (now " + Math.round((state.prestige.current_income_bonus || 0) * 100) + "%).",
            "Resets: all facilities, research, asset holdings, contracts, boosters, level, XP and RP.",
            "Keeps: wallet balance and earned prestige points. Total after reset: " + (profile.prestige_points + state.prestige.pp_gain) + " PP."
          ]}
          confirmLabel="Prestige"
          danger={true}
          busy={busy}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            setConfirmModal(null);
            runAction(() => empire.act("prestige", {}), "Prestige completed");
          }}
        />
      )}

      {tradeModal && (
        <TradeModal
          assetId={tradeModal.assetId}
          side={tradeModal.side}
          state={state}
          liveBalance={liveBalance}
          fee={constants.asset_trade_fee_rate || 0.01}
          busy={busy}
          onClose={() => setTradeModal(null)}
          onConfirm={(shares) => {
            var m = tradeModal;
            setTradeModal(null);
            runAction(
              () => empire.act(m.side === "buy" ? "buy_asset" : "sell_asset", { asset_id: m.assetId, shares: shares }),
              m.side === "buy" ? "Shares purchased" : "Shares sold"
            );
          }}
        />
      )}
    </div>
  );
};

export default Empire;

// ===================== BUILD TAB =====================

function BuildTab(props) {
  var config = props.config;
  var sectors = config.sectors || [];
  var defs = config.objects || [];
  var bySector = {};
  sectors.forEach(function (s) { bySector[s.ID] = []; });
  defs.forEach(function (d) {
    if (!bySector[d.sector]) bySector[d.sector] = [];
    bySector[d.sector].push(d);
  });
  Object.keys(bySector).forEach(function (k) {
    bySector[k].sort(function (a, b) { return a.base_cost - b.base_cost; });
  });

  return (
    <div className="emp-panel">
      {sectors.map(function (s) {
        var list = bySector[s.ID] || [];
        if (!list.length) return null;
        return (
          <div key={s.ID} className="emp-build-group">
            <div className="emp-build-group-title">
              <span>{s.Name}</span>
            </div>
            {list.map(function (d) {
              var locked = props.profile.level < d.unlock_level;
              var afford = props.liveBalance >= d.base_cost;
              return (
                <div key={d.id} className="emp-build-row">
                  <span className="emp-rarity-dot" style={{ background: RARITY_COLORS[d.rarity] || RARITY_COLORS.common }}></span>
                  <div className="emp-build-main">
                    <span className="emp-build-name">{d.name}</span>
                    <span className="emp-build-meta">
                      {formatMoney(d.base_income) + "/h · slots " + d.worker_slots + (d.rp_per_hour > 0 ? " · RP " + d.rp_per_hour + "/h" : "")}
                    </span>
                  </div>
                  {locked ? (
                    <span className="emp-build-lock">{"Lv " + d.unlock_level}</span>
                  ) : (
                    <button
                      className="emp-btn small"
                      disabled={props.busy || !afford}
                      onClick={() => props.onBuy(d.id)}
                    >
                      {formatMoney(d.base_cost)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ===================== RESEARCH TAB =====================

function ResearchTab(props) {
  var state = props.state;
  var rp = state.profile.rp;
  return (
    <div className="emp-panel">
      <div className="emp-rp-banner">{"Available RP: " + formatInt(rp) + " (+" + (state.rates.rp_per_hour || 0).toFixed(1) + "/h from research facilities)"}</div>
      {(state.research_defs || []).map(function (d) {
        var maxed = d.level >= d.max_level;
        var pips = [];
        for (var i = 0; i < d.max_level; i++) {
          pips.push(<span key={i} className={"emp-pip" + (i < d.level ? " on" : "")}></span>);
        }
        return (
          <div key={d.id} className="emp-research-card">
            <div className="emp-research-head">
              <div className="emp-research-main">
                <span className="emp-research-name">{d.name}</span>
                <span className="emp-research-desc">{d.description}</span>
              </div>
              <div className="emp-pips">{pips}</div>
            </div>
            <div className="emp-research-foot">
              <span className="emp-research-effect">{"+" + Math.round(d.effect_per_level * 100) + "% per level"}</span>
              {maxed ? (
                <span className="emp-tag">MAX</span>
              ) : (
                <button
                  className="emp-btn small"
                  disabled={props.busy || rp < d.next_rp || state.balance < d.next_money}
                  onClick={() => props.onBuy(d.id)}
                >
                  {"$" + formatInt(d.next_money) + " · " + formatInt(d.next_rp) + " RP"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===================== EXCHANGE TAB =====================

function ExchangeTab(props) {
  var state = props.state;
  var assets = state.config.assets || [];
  var prices = state.assets.prices || {};
  var holdings = state.assets.holdings || {};

  return (
    <div className="emp-panel">
      <div className="emp-exchange-total">
        <span className="emp-exchange-total-label">Portfolio value</span>
        <span className="emp-exchange-total-value">{formatBig(state.assets_value)}</span>
      </div>
      {assets.map(function (a) {
        var price = prices[a.id] || a.base_price;
        var h = holdings[a.id];
        var hist = state.assets.history[a.id] || [];
        var change = 0;
        if (hist.length > 1 && hist[0].price > 0) {
          change = ((hist[hist.length - 1].price - hist[0].price) / hist[0].price) * 100;
        }
        return (
          <div key={a.id} className="emp-asset-card">
            <div className="emp-asset-head">
              <div className="emp-asset-main">
                <span className="emp-asset-name">{a.name}</span>
                <span className={"emp-asset-change " + (change >= 0 ? "pos" : "neg")}>
                  {(change >= 0 ? "+" : "") + change.toFixed(2) + "% 24h"}
                </span>
              </div>
              <Sparkline history={hist} />
            </div>
            <div className="emp-asset-price-row">
              <span className="emp-asset-price">{formatMoney(price)}</span>
              <span className="emp-asset-dividend">{"dividend " + (a.daily_dividend_yield * 100).toFixed(2) + "%/day"}</span>
            </div>
            {h && h.shares > 0 && (
              <div className="emp-asset-holding">
                <span>{formatInt(h.shares) + " sh · avg " + formatMoney(h.avg_price)}</span>
                <span className="emp-asset-holding-value">
                  {formatMoney(h.value) + " · div " + formatMoney(h.dividends_earned)}
                </span>
              </div>
            )}
            <div className="emp-asset-actions">
              <button className="emp-btn ghost" disabled={props.busy || props.liveBalance < price} onClick={() => props.onOpen(a.id, "buy")}>Buy</button>
              <button className="emp-btn ghost" disabled={props.busy || !h || h.shares < 1} onClick={() => props.onOpen(a.id, "sell")}>Sell</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===================== CONTRACTS TAB =====================

function ContractsTab(props) {
  var contracts = props.state.contracts || [];
  if (!contracts.length) {
    return (
      <div className="emp-panel">
        <div className="emp-empty-card">
          <span>No active contracts — new offers arrive every few hours</span>
        </div>
      </div>
    );
  }
  return (
    <div className="emp-panel">
      {contracts.map(function (c) {
        var isMoney = c.metric === "revenue" || c.metric === "energy_income";
        var pct = c.target > 0 ? Math.min(100, (c.progress / c.target) * 100) : 0;
        var done = c.progress >= c.target;
        var left = c.expires_at - props.nowTick / 1000;
        var progressLabel = isMoney
          ? formatMoney(c.progress) + " / " + formatMoney(c.target)
          : formatInt(c.progress) + " / " + formatInt(c.target);
        return (
          <div key={c.id} className={"emp-contract-card" + (done ? " done" : "")}>
            <div className="emp-contract-head">
              <span className="emp-contract-title">{c.title}</span>
              <span className="emp-contract-timer">{formatHMS(left)}</span>
            </div>
            <span className="emp-contract-desc">{c.description}</span>
            <div className="emp-contract-bar">
              <div className="emp-contract-fill" style={{ width: pct + "%" }}></div>
            </div>
            <div className="emp-contract-foot">
              <span className="emp-contract-progress">{progressLabel}</span>
              <span className="emp-contract-reward">
                {formatMoney(c.reward_money) + " · XP " + formatInt(c.reward_xp) + " · RP " + formatInt(c.reward_rp)}
              </span>
            </div>
            <button
              className="emp-btn wide"
              disabled={props.busy || !done}
              onClick={() => props.onClaim(c.id)}
            >
              {done ? "Claim reward" : "In progress"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ===================== BOOSTERS TAB =====================

function BoostersTab(props) {
  var config = props.state.config;
  var defs = config.boosters || [];
  var prices = config.booster_prices || {};
  var active = props.state.boosters || {};

  return (
    <div className="emp-panel">
      {defs.map(function (b) {
        var until = active[b.id] || 0;
        var remaining = until * 1000 - props.nowTick;
        return (
          <div key={b.id} className="emp-booster-card">
            <div className="emp-booster-head">
              <div className="emp-booster-main">
                <span className="emp-booster-name">{b.name}</span>
                <span className="emp-booster-desc">{b.description}</span>
              </div>
              {remaining > 0 && <span className="emp-booster-active">{formatHMS(remaining / 1000) + " left"}</span>}
            </div>
            <div className="emp-booster-durs">
              {BOOSTER_DURATIONS.map(function (dur) {
                var p = prices[b.id] ? prices[b.id][String(dur)] : null;
                if (p == null) return null;
                return (
                  <button
                    key={dur}
                    className="emp-btn small ghost"
                    disabled={props.busy}
                    onClick={() => props.onBuy(b.id, dur)}
                  >
                    {formatDurHours(dur) + " · " + formatMoney(p)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===================== ANALYTICS TAB =====================

var LEADERBOARD_METRICS = [
  { key: "roi", label: "ROI" },
  { key: "total_profit", label: "Profit" },
  { key: "profit_per_hour", label: "Profit/h" },
  { key: "efficiency", label: "Efficiency" },
  { key: "upgrade_efficiency", label: "Upg. eff." },
  { key: "payback_hours", label: "Payback" }
];

function AnalyticsTab(props) {
  var state = props.state;
  var a = state.analytics;
  var sectors = state.config.sectors || [];
  var [sortKey, setSortKey] = useState("roi");

  var board = (state.leaderboard || []).slice().sort(function (x, y) {
    return (y[sortKey] || 0) - (x[sortKey] || 0);
  }).slice(0, 15);

var profile = state.profile;
var rates = state.rates;

  return (
    <div className="emp-panel">
      <div className="emp-ana-totals">
        <div className="emp-ana-total">
          <span className="emp-ana-total-label">Total earned</span>
          <span className="emp-ana-total-value pos">{formatBig(a.total_earned)}</span>
        </div>
        <div className="emp-ana-total">
          <span className="emp-ana-total-label">Total spent</span>
          <span className="emp-ana-total-value neg">{formatBig(a.total_spent)}</span>
        </div>
        <div className="emp-ana-total">
          <span className="emp-ana-total-label">All-time</span>
          <span className="emp-ana-total-value">{formatBig(a.all_time_earned)}</span>
        </div>
      </div>

<div className="emp-hero-grid">
  <div className="emp-hero-cell">
    <span className="emp-hero-cell-label">Income</span>
    <span className="emp-hero-cell-value pos">
      {formatMoney(rates.income_per_hour) + "/h"}
    </span>
  </div>

  <div className="emp-hero-cell">
    <span className="emp-hero-cell-label">Expenses</span>
    <span className="emp-hero-cell-value neg">
      {formatMoney(rates.expenses_per_hour) + "/h"}
    </span>
  </div>

 
</div>

      <div className="emp-ana-block-title">Last 14 days</div>
      <DailyBars days={a.daily || []} />

      <div className="emp-ana-block-title">Per sector</div>
      <div className="emp-sector-table">
        {sectors.map(function (s) {
          var st = (a.per_sector || {})[s.ID] || { count: 0, income_per_hour: 0, value: 0 };
          return (
            <div key={s.ID} className="emp-sector-row">
              <span className="emp-sector-dot" style={{ background: s.Color }}></span>
              <span className="emp-sector-row-name">{s.Name}</span>
              <span className="emp-sector-row-meta">{st.count + " obj"}</span>
              <span className="emp-sector-row-income">{formatMoney(st.income_per_hour) + "/h"}</span>
              <span className="emp-sector-row-value">{formatBig(st.value)}</span>
            </div>
          );
        })}
      </div>

      <div className="emp-ana-block-title">Facility leaderboard</div>
      <div className="emp-lb-metrics">
        {LEADERBOARD_METRICS.map(function (m) {
          return (
            <button key={m.key} className={"emp-lb-chip" + (sortKey === m.key ? " active" : "")} onClick={() => setSortKey(m.key)}>
              {m.label}
            </button>
          );
        })}
      </div>
      <div className="emp-lb-list">
        {board.map(function (r, i) {
          var v;
          if (sortKey === "roi" || sortKey === "efficiency" || sortKey === "upgrade_efficiency") v = (r[sortKey] || 0).toFixed(1) + "%";
          else if (sortKey === "payback_hours") v = formatPayback(r[sortKey]);
          else v = formatBig(r[sortKey]);
          var sec = sectors.filter(function (s) { return s.ID === r.sector; })[0];
          return (
            <div key={r.instance_id} className="emp-lb-row">
              <span className="emp-lb-rank">{i + 1}</span>
              <div className="emp-lb-main">
                <span className="emp-lb-name">{r.name}</span>
                <span className="emp-lb-meta">{(sec ? sec.Name : r.sector) + " · Lv " + (r.level || 1)}</span>
              </div>
              <span className="emp-lb-value">{v}</span>
            </div>
          );
        })}
      </div>

      <div className="emp-ana-block-title">Recent events</div>
      <div className="emp-events">
        {(a.recent_events || []).map(function (e, i) {
          var label = EVENT_LABELS[e.type] || e.type;
          var amount = e.type === "prestige"
            ? "+" + formatInt(e.amount) + " PP"
            : (e.type === "research" ? "" : formatMoney(e.amount));
          return (
            <div key={i} className="emp-event-row">
              <span className="emp-event-type">{label}</span>
              <span className="emp-event-ref">{e.ref || "—"}</span>
              <span className={"emp-event-amount " + (e.amount >= 0 ? "pos" : "neg")}>{amount}</span>
              <span className="emp-event-time">{formatAgo(e.t)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== ПАСПОРТ ОБЪЕКТА =====================

function PassportModal(props) {
  var o = props.object;
  var config = props.config;
  var constants = config.constants || {};
  var [name, setName] = useState(o.name);

  var def = (config.objects || []).filter(function (d) { return d.id === o.def_id; })[0];
  var hireCost = def ? def.base_cost * (constants.worker_hire_cost_rate || 0.08) : 0;
  var canHire = o.workers_hired < o.worker_slots;
  var maxed = o.level >= o.max_level;

  return (
    <div className="emp-modal-overlay" onClick={props.onClose}>
      <div className="emp-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="emp-modal-head">
          <div className="emp-modal-title-wrap">
            <span className="emp-rarity-dot lg" style={{ background: RARITY_COLORS[o.rarity] || RARITY_COLORS.common }}></span>
            <span className="emp-modal-title">{o.name}</span>
          </div>
        </div>

        <div className="emp-pp-grid">
          <PassportCell label="Income" value={formatMoney(o.income_per_hour) + "/h"} cls="pos" />
          <PassportCell label="Expenses" value={formatMoney(o.expenses_per_hour) + "/h"} cls="neg" />
          <PassportCell label="Net" value={formatMoney(o.net_per_hour) + "/h"} cls={o.net_per_hour >= 0 ? "pos" : "neg"} />
          <PassportCell label="Efficiency" value={(o.efficiency || 0).toFixed(1) + "%"} />
          <PassportCell label="Value" value={formatBig(o.current_value)} />
          <PassportCell label="Invested" value={formatBig(o.invested)} />
          <PassportCell label="Lifetime earned" value={formatBig(o.lifetime_earned)} cls="pos" />
          <PassportCell label="Payback" value={formatPayback(o.payback_hours)} />
          <PassportCell label="RP" value={(o.rp_per_hour || 0).toFixed(1) + "/h"} />
          <PassportCell label="Age" value={formatAgeHours(o.age_hours)} />
          <PassportCell label="Workers" value={o.workers_hired + " / " + o.worker_slots} />
          <PassportCell label="Quality" value={Math.round((o.worker_quality || 0) * 100) + "%"} />
        </div>

        <div className="emp-pp-rename">
          <input
            className="emp-input"
            value={name}
            maxLength={64}
            onChange={(e) => setName(e.target.value)}
            placeholder="Facility name"
          />
          <button
            className="emp-btn ghost"
            disabled={props.busy || !name.trim() || name.trim() === o.name}
            onClick={() => props.onRename(name.trim())}
          >
            Rename
          </button>
        </div>

        {!maxed && (
          <button className="emp-btn wide" disabled={props.busy} onClick={props.onUpgrade}>
            {"Upgrade to Lv " + (o.level + 1) + " · " + formatMoney(o.upgrade_cost) + " (+" + formatMoney(o.upgrade_income_gain) + "/h)"}
          </button>
        )}
        {canHire && (
          <button className="emp-btn wide ghost" disabled={props.busy} onClick={props.onHire}>
            {"Hire worker · " + formatMoney(hireCost) + " (+" + Math.round((constants.worker_income_bonus_per_worker || 0.06) * 100) + "% income)"}
          </button>
        )}
        <button className="emp-btn wide danger" disabled={props.busy} onClick={props.onSell}>
          {"Sell for " + formatMoney(o.sell_value)}
        </button>
      </div>
    </div>
  );
}

function PassportCell(props) {
  return (
    <div className="emp-pp-cell">
      <span className="emp-pp-cell-label">{props.label}</span>
      <span className={"emp-pp-cell-value " + (props.cls || "")}>{props.value}</span>
    </div>
  );
}

// ===================== ПОДТВЕРЖДЕНИЕ (sell / prestige) =====================

function ConfirmModal(props) {
  return (
    <div className="emp-modal-overlay" onClick={props.onCancel}>
      <div className="emp-modal-card sm" onClick={(e) => e.stopPropagation()}>
        <div className="emp-modal-title">{props.title}</div>
        <div className="emp-confirm-lines">
          {props.lines.map(function (l, i) { return <p key={i}>{l}</p>; })}
        </div>
        <button className={"emp-btn wide " + (props.danger ? "danger" : "")} disabled={props.busy} onClick={props.onConfirm}>
          {props.confirmLabel}
        </button>
        <button className="emp-btn wide ghost" disabled={props.busy} onClick={props.onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ===================== МОДАЛКА ТОРГОЛИ АКЦИЯМИ =====================

function TradeModal(props) {
  var state = props.state;
  var assets = state.config.assets || [];
  var def = assets.filter(function (a) { return a.id === props.assetId; })[0];
  var price = (state.assets.prices || {})[props.assetId] || (def ? def.base_price : 0);
  var holding = (state.assets.holdings || {})[props.assetId];
  var owned = holding ? holding.shares : 0;

  var [amount, setAmount] = useState("1");
  var shares = parseInt(amount, 10);
  if (isNaN(shares) || shares < 1) shares = 0;

  var isBuy = props.side === "buy";
  var total = shares * price;
  var feeAmount = total * props.fee;
  var proceeds = total - feeAmount;
  var maxBuy = price > 0 ? Math.floor(props.liveBalance / price) : 0;
  var over = isBuy ? (total > props.liveBalance || shares < 1) : (shares < 1 || shares > owned);

  return (
    <div className="emp-modal-overlay" onClick={props.onClose}>
      <div className="emp-modal-card sm" onClick={(e) => e.stopPropagation()}>
        <div className="emp-modal-head">
          <span className="emp-modal-title">{(isBuy ? "Buy " : "Sell ") + (def ? def.name : "")}</span>
        </div>
        <div className="emp-trade-price">{formatMoney(price) + " per share"}</div>
        <input
          className="emp-input"
          value={amount}
          inputMode="numeric"
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Shares amount"
        />
        <div className="emp-trade-quick">
          <button className="emp-lb-chip" onClick={() => setAmount("1")}>1</button>
          <button className="emp-lb-chip" onClick={() => setAmount(String(Math.max(1, Math.floor(maxBuy / 2))))}>{"Max buy " + formatInt(Math.max(1, Math.floor(maxBuy / 2)))}</button>
          <button className="emp-lb-chip" onClick={() => setAmount(String(Math.max(1, maxBuy)))}>Max</button>
          {!isBuy && <button className="emp-lb-chip" onClick={() => setAmount(String(owned))}>All {formatInt(owned)}</button>}
        </div>
        <div className="emp-trade-summary">
          <span>{isBuy ? "Cost" : "Proceeds (fee " + (props.fee * 100).toFixed(1) + "%)"}</span>
          <span className="emp-trade-total">{formatMoney(isBuy ? total : proceeds)}</span>
        </div>
        <button className="emp-btn wide" disabled={props.busy || over} onClick={() => props.onConfirm(shares)}>
          {isBuy ? "Buy" : "Sell"}
        </button>
      </div>
    </div>
  );
}

// ===================== СПАРКЛАЙН =====================

function Sparkline(props) {
  var hist = props.history || [];
  if (hist.length < 2) return <div className="emp-spark-empty">—</div>;
  var data = hist;
  if (hist.length > 60) {
    var stride = Math.ceil(hist.length / 60);
    data = hist.filter(function (_, i) { return i % stride === 0; });
    data.push(hist[hist.length - 1]);
  }
  var W = 120, H = 36, PAD = 2;
  var min = Infinity, max = -Infinity;
  data.forEach(function (p) { min = Math.min(min, p.price); max = Math.max(max, p.price); });
  var range = max - min || 1;
  var step = (W - PAD * 2) / (data.length - 1);
  var pts = data.map(function (p, i) {
    var x = PAD + i * step;
    var y = H - PAD - ((p.price - min) / range) * (H - PAD * 2);
    return x.toFixed(1) + "," + y.toFixed(1);
  }).join(" ");
  var up = data[data.length - 1].price >= data[0].price;
 
}

// ===================== ДНЕВНОЙ ГРАФИК =====================

function DailyBars(props) {
  var days = props.days || [];
  if (!days.length) return <div className="emp-empty-card"><span>No data yet</span></div>;
  var maxV = 0;
  days.forEach(function (d) { maxV = Math.max(maxV, d.income, d.expenses); });
  if (maxV <= 0) maxV = 1;
  return (
    <div className="emp-daily">
      {days.map(function (d) {
        var label = d.day ? d.day.slice(5) : "";
        return (
          <div key={d.day} className="emp-daily-col" title={d.day + ": +" + formatMoney(d.income) + " / -" + formatMoney(d.expenses)}>
            <div className="emp-daily-bars">
              <div className="emp-daily-bar inc" style={{ height: Math.max(3, (d.income / maxV) * 100) + "%" }}></div>
              <div className="emp-daily-bar exp" style={{ height: Math.max(3, (d.expenses / maxV) * 100) + "%" }}></div>
            </div>
            <span className="emp-daily-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}