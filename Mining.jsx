import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMining } from "./useMining";
import { useWalletBalance } from "./useWallet";

var PAGE_SIZE = 5;

var PERK_LABELS = {
  efficient: "Efficient", overclocked: "Overclocked", coldroom: "Cold Room",
  turbo: "Turbo", stable: "Stable", silent: "Silent"
};

function ChevronLeft() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
}
function WalletChipIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><path d="M16 12h.01"></path></svg>);
}
function BoltIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>);
}
function BatteryIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="7" width="18" height="10" rx="2"></rect><line x1="23" y1="11" x2="23" y2="13"></line></svg>);
}
function ServerIcon() {
  return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="6" rx="1.5"></rect><rect x="2" y="15" width="20" height="6" rx="1.5"></rect><line x1="6" y1="6" x2="6" y2="6"></line><line x1="6" y1="18" x2="6" y2="18"></line></svg>);
}
function ShopIcon() {
  return (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>);
}
function CloseIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
}
function TrashIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>);
}

function formatMoney(v) { return "$" + (v || 0).toFixed(2); }
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
function formatAge(iso) {
  var ms = Date.now() - new Date(iso).getTime();
  return formatHMS(ms / 1000);
}

const Mining = () => {
  const navigate = useNavigate();
  var mining = useMining();
  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var state = mining.state;

  var [nowTick, setNowTick] = useState(Date.now());
  var [serverPage, setServerPage] = useState(0);
  var [detailServerId, setDetailServerId] = useState(null);
  var [busy, setBusy] = useState(false);
  var [toast, setToast] = useState(null);
  var toastTimerRef = useRef(null);

  useEffect(function () {
    var iv = setInterval(function () { setNowTick(Date.now()); }, 1000);
    return function () { clearInterval(iv); };
  }, []);

  function showToast(ok, text) {
    setToast({ ok: ok, text: text });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(function () { setToast(null); }, 3200);
  }

  useEffect(function () {
    return function () { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

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

  var servers = state.servers || [];
  var totalPages = Math.max(1, Math.ceil(servers.length / PAGE_SIZE));
  var page = Math.min(serverPage, totalPages - 1);
  var visibleServers = servers.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  var detailServer = servers.filter(function (s) { return s.id === detailServerId; })[0] || null;

  var energyPct = state.profile.maxEnergy > 0 ? Math.min(100, (state.profile.energy / state.profile.maxEnergy) * 100) : 0;

  return (
    <div className="mng-page">
      <div className="mng-topbar">
        <span className="mng-title">Mining</span>
        <div className="mng-balance-chip">
          <WalletChipIcon />
          <span>{"$" + (wallet.balance || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* ── Мощность и энергия ─────────────────────────────── */}
      <div className="mng-overview">
        <div className="mng-overview-label"><BoltIcon /> Total Power</div>
        <div className="mng-overview-value">{Math.round(state.totalPower).toLocaleString("en-US")}</div>
        <div className="mng-overview-sub">
          {formatMoney(state.totalProfitPerHour) + "/h · " + formatMoney(state.totalProfitPerDay) + "/day"}
        </div>
        <div className="mng-energy-block">
          <div className="mng-energy-top">
            <div className="mng-overview-label"><BatteryIcon /> Energy</div>
            <span className="mng-energy-value">{Math.round(state.profile.energy) + " / " + Math.round(state.profile.maxEnergy)}</span>
          </div>
          <div className="mng-energy-bar">
            <div className="mng-energy-fill" style={{ width: energyPct + "%" }}></div>
          </div>
         
        </div>
      </div>

      {/* ── Активные баффы ─────────────────────────────────── */}
      {state.buffs && state.buffs.length > 0 && (
        <div className="mng-buffs-strip">
          {state.buffs.map(function (b) {
            var remaining = b.secondsRemaining - (nowTick - mining.stateAtRef.current) / 1000;
            return (
              <div key={b.type} className="mng-buff-chip">
                <span className="mng-buff-name">{PERK_LABELS[b.type] || b.type}</span>
                <span className="mng-buff-timer">{formatHMS(remaining)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Мои серверы ────────────────────────────────────── */}
      <div className="mng-section">
        <div className="mng-section-head">
          <span className="mng-section-title">My Servers</span>
          <span className="mng-section-count">{state.totalOwnedServers + " / " + state.maxTotalServers}</span>
        </div>

        {servers.length === 0 ? (
          <div className="mng-empty-card">
            <ServerIcon />
            <span>No servers yet — grab your first one in the shop</span>
          </div>
        ) : (
          <>
            <div className="mng-server-list">
              {visibleServers.map(function (s) {
                var awakeRemaining = s.awakeUntil ? (new Date(s.awakeUntil).getTime() - nowTick) / 1000 : 0;
                return (
                  <div key={s.id} className="mng-server-row" onClick={() => setDetailServerId(s.id)}>
                    <div className="mng-server-main">
                      <span className="mng-server-name">{s.name}</span>
                      <span className="mng-server-meta">{"Rank " + s.rank + "/" + s.maxRank + " · " + s.country}</span>
                    </div>
                    <div className="mng-server-stats">
                      <span className="mng-server-power">{Math.round(s.power).toLocaleString("en-US")}</span>
                      <span className="mng-server-profit">{"+" + formatMoney(s.profitPerHour) + "/h"}</span>
                    </div>
                    <div className="mng-server-action">
                      {s.exhausted ? (
                        <span className="mng-tag exhausted">Exhausted</span>
                      ) : s.alwaysOn ? (
                        <span className="mng-tag always-on">Always On</span>
                      ) : s.awake ? (
                        <span className="mng-tag awake">{formatHMS(awakeRemaining)}</span>
                      ) : (
                        <button className="mng-wake-btn" disabled={busy} onClick={(e) => { e.stopPropagation(); runAction(() => mining.wakeServer(s.id), "Server woken up"); }}>
                          Wake
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="mng-pagination">
                <button className="mng-page-btn" disabled={page === 0} onClick={() => setServerPage(page - 1)}>Back</button>
                <span className="mng-page-label">{(page + 1) + " / " + totalPages}</span>
                <button className="mng-page-btn" disabled={page >= totalPages - 1} onClick={() => setServerPage(page + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Вход в магазин (отдельный экран) ───────────────── */}
      <button className="mng-shop-entry" onClick={() => navigate("/miningshop")}>
        <ShopIcon />
        <span>Open Shop</span>
      </button>

      {/* ── Статистика ─────────────────────────────────────── */}
      <div className="mng-stats">
        <div className="mng-section-head">
          <span className="mng-section-title">Statistics</span>
        </div>
        <div className="mng-stats-row">
          <div className="mng-stat-item">
            <span className="mng-stat-label">Total Earned</span>
            <span className="mng-stat-value pos">{formatMoney(state.profile.lifetimeEarned)}</span>
          </div>
          <div className="mng-stat-item">
            <span className="mng-stat-label">Total Spent</span>
            <span className="mng-stat-value">{formatMoney(state.profile.lifetimeSpent)}</span>
          </div>
        </div>
        <div className="mng-stats-row">
          <div className="mng-stat-item">
            <span className="mng-stat-label">Energy Used</span>
            <span className="mng-stat-value">{Math.round(state.profile.lifetimeEnergyUsed).toLocaleString("en-US")}</span>
          </div>
          <div className="mng-stat-item">
            <span className="mng-stat-label">Servers</span>
            <span className="mng-stat-value">{state.totalOwnedServers + " / " + state.maxTotalServers}</span>
          </div>
        </div>
        



          <div className="mng-stats-row">
          <div className="mng-stat-item">
            <span className="mng-stat-label">use</span>
            <span className="mng-stat-value">{state.totalEnergyPerHour > 0 ? "Lasts ~" + formatHMS(state.estimatedMinutesLeft * 60) : "No drain"}</span>
          </div>
          <div className="mng-stat-item">
            <span className="mng-stat-label">use all</span>
            <span className="mng-stat-value">{"Drain: " + state.totalEnergyPerHour.toFixed(1) + "/h"}</span>
          </div>
        </div>


      </div>

      {toast && <div className={"mng-toast " + (toast.ok ? "ok" : "err")}>{toast.text}</div>}

      {detailServer && (
        <ServerDetailModal
          server={detailServer}
          busy={busy}
          onClose={() => setDetailServerId(null)}
          onWake={() => runAction(() => mining.wakeServer(detailServer.id), "Server woken up")}
          onUpgrade={() => runAction(() => mining.upgradeServer(detailServer.id), "Rank upgraded")}
          onDelete={() => { runAction(() => mining.deleteServer(detailServer.id), "Server sold"); setDetailServerId(null); }}
        />
      )}
    </div>
  );
};

// ===================== МОДАЛКА: ДЕТАЛИ СЕРВЕРА =====================

function ServerDetailModal(props) {
  var s = props.server;
  var capPct = s.lifetimeCap > 0 ? Math.min(100, (s.totalEarned / s.lifetimeCap) * 100) : 0;
  return (
    <div className="mng-modal-overlay" onClick={props.onClose}>
      <div className="mng-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="mng-modal-head">
          <span className="mng-modal-title">{s.name}</span>
          <button className="mng-modal-close" onClick={props.onClose}><CloseIcon /></button>
        </div>
        <span className="mng-modal-sub">{"Rank " + s.rank + "/" + s.maxRank + " · " + s.country}</span>

        <div className="mng-detail-grid">
          <div className="mng-detail-item"><span>Power</span><span>{Math.round(s.power).toLocaleString("en-US")}</span></div>
          <div className="mng-detail-item"><span>Profit / Hour</span><span>{formatMoney(s.profitPerHour)}</span></div>
          <div className="mng-detail-item"><span>Profit / Day</span><span>{formatMoney(s.profitPerDay)}</span></div>
          <div className="mng-detail-item"><span>Energy / Hour</span><span>{s.energyPerHour.toFixed(1)}</span></div>
          <div className="mng-detail-item"><span>Total Earned</span><span>{formatMoney(s.totalEarned)}</span></div>
          <div className="mng-detail-item"><span>Energy Used</span><span>{Math.round(s.totalEnergyUsed).toLocaleString("en-US")}</span></div>
          <div className="mng-detail-item"><span>Owned For</span><span>{formatAge(s.purchasedAt)}</span></div>
          <div className="mng-detail-item"><span>Status</span><span>{s.exhausted ? "Exhausted" : s.alwaysOn ? "Always On" : s.awake ? "Running" : "Sleeping"}</span></div>
        </div>

        <div className="mng-cap-block">
          <div className="mng-cap-top"><span>Lifetime Profit</span><span>{formatMoney(s.totalEarned) + " / " + formatMoney(s.lifetimeCap)}</span></div>
          <div className="mng-cap-bar"><div className="mng-cap-fill" style={{ width: capPct + "%" }}></div></div>
        </div>

        {s.perks && s.perks.length > 0 && (
          <div className="mng-perk-chips">
            {s.perks.map(function (p) { return <span key={p} className="mng-perk-chip">{PERK_LABELS[p] || p}</span>; })}
          </div>
        )}

        <div className="mng-modal-actions">
          {!s.exhausted && !s.alwaysOn && !s.awake && (
            <button className="mng-modal-primary-btn" disabled={props.busy} onClick={props.onWake}>Wake Up</button>
          )}
          {s.canUpgrade && !s.exhausted && (
            <button className="mng-modal-primary-btn" disabled={props.busy} onClick={props.onUpgrade}>
              {"Upgrade · " + formatMoney(s.nextRankCost)}
            </button>
          )}
          <button className="mng-modal-danger-btn" disabled={props.busy} onClick={props.onDelete}>
            <TrashIcon /> Sell for 50%
          </button>
        </div>
      </div>
    </div>
  );
}

export default Mining;