import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { authFetch } from "./apiClient";
import { useWalletBalance } from "./useWallet";
import { useBankCards } from "./useBankCards";

var START_MULT = 0.5;
var GROWTH_RATE = 0.09;
var MAX_MULT = 5.0;
var AUTO_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "1.20x", value: 1.2 },
  { label: "1.50x", value: 1.5 },
  { label: "2.00x", value: 2 },
  { label: "3.00x", value: 3 },
  { label: "5.00x", value: 5 }
];
var PRESETS = [10, 50, 100, 500];


function ClockIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 16 14"></polyline></svg>);
}
function WalletChipIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><path d="M16 12h.01"></path></svg>);
}

function formatCountdown(seconds) {
  var s = Math.max(0, Math.ceil(seconds));
  return "00:" + (s < 10 ? "0" + s : s);
}

const Rocket = () => {
  const navigate = useNavigate();
  var { wallet } = useWalletBalance();
  var { data: cardsData } = useBankCards();
  var activeCard = cardsData ? cardsData.cards.find(function (c) { return c.isActiveForTrading; }) : null;
  var displayBalance = activeCard ? activeCard.balance : wallet.balance;

  var [serverState, setServerState] = useState(null);
  var [localMultiplier, setLocalMultiplier] = useState(START_MULT);
  var [amountInput, setAmountInput] = useState("10");
  var [autoTarget, setAutoTarget] = useState(0);
  var [isBetting, setIsBetting] = useState(false);
  var [isCashing, setIsCashing] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);
  var [outcomeMsg, setOutcomeMsg] = useState(null);

  var containerRef = useRef(null);
  var chartRef = useRef(null);
  var seriesRef = useRef(null);
  var lastCandleRef = useRef(null);

  var elapsedBaseRef = useRef({ elapsed: 0, capturedAt: 0 });
  var lastRoundRef = useRef({ roundId: null, phase: null });
  var myBetSeenRef = useRef(null);
  var autoFiredRef = useRef(false);
// ── Chart setup ──────────────────────────────────────────
useEffect(function () {
  var container = containerRef.current;
  if (!container) return;

  var chart = createChart(container, {
    layout: {
      background: { type: "solid", color: "transparent" },
      textColor: "rgba(255,255,255,0.3)"
    },
    grid: {
      vertLines: { color: "rgba(255,255,255,0.04)" },
      horzLines: { color: "rgba(255,255,255,0.04)" }
    },
    rightPriceScale: {
      borderVisible: false
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: true
    },
    crosshair: {
      vertLine: { color: "rgba(255,255,255,0.12)" },
      horzLine: { color: "rgba(255,255,255,0.12)" }
    },
    handleScroll: false,
    handleScale: false
  });

  var series = chart.addSeries(CandlestickSeries, {
    upColor: "#e8ecef",
    downColor: "#3a3d42",
    borderVisible: false,
    wickUpColor: "rgba(255,255,255,0.35)",
    wickDownColor: "rgba(255,255,255,0.2)"
  });

  chartRef.current = chart;
  seriesRef.current = series;

  function resizeChart() {
    if (!container || !chart) return;

    var width = container.clientWidth;
    var height = container.clientHeight;

    if (width > 0 && height > 0) {
      chart.resize(width, height);
    }
  }

  requestAnimationFrame(function () {
    resizeChart();

    requestAnimationFrame(function () {
      resizeChart();
    });
  });

  var observer = new ResizeObserver(function () {
    resizeChart();
  });

  observer.observe(container);

  return function () {
    observer.disconnect();

    if (chartRef.current === chart) {
      chartRef.current = null;
      seriesRef.current = null;
    }

    chart.remove();
  };
}, [serverState !== null]);


  // ── Poll server state ────────────────────────────────────
  useEffect(function () {
    var cancelled = false;
    function poll() {
      authFetch("/rocket/state").then(function (data) {
        if (cancelled) return;
        setServerState(data);
      }).catch(function () {});
    }
    poll();
    var iv = setInterval(poll, 600);
    return function () { cancelled = true; clearInterval(iv); };
  }, []);

  // ── React to server state changes ───────────────────────
  useEffect(function () {
    if (!serverState) return;

    var prev = lastRoundRef.current;
    var roundChanged = prev.roundId !== serverState.roundId;

    if (roundChanged && serverState.phase === "betting") {
      // A round just ended. Did we have an unresolved bet that never got cashed out?
      if (myBetSeenRef.current && myBetSeenRef.current.status === "active") {
        setOutcomeMsg({ ok: false, text: "Crashed — lost $" + myBetSeenRef.current.amount.toFixed(2) });
      }
      myBetSeenRef.current = null;
      autoFiredRef.current = false;
      if (seriesRef.current) seriesRef.current.setData([]);
      lastCandleRef.current = null;
      setLocalMultiplier(START_MULT);
    }

    if (serverState.myBet) {
      myBetSeenRef.current = serverState.myBet;
    }

    // Seed local extrapolation base from server's authoritative multiplier
    if (serverState.phase === "running") {
      var impliedElapsed = Math.log(serverState.currentMultiplier / START_MULT) / GROWTH_RATE;
      elapsedBaseRef.current = { elapsed: isFinite(impliedElapsed) ? impliedElapsed : 0, capturedAt: performance.now() };
    } else {
      setLocalMultiplier(START_MULT);
    }

    lastRoundRef.current = { roundId: serverState.roundId, phase: serverState.phase };
  }, [serverState]);

  // ── Local smooth ticking + candle building ──────────────
  useEffect(function () {
    var tick = setInterval(function () {
      if (!serverState || serverState.phase !== "running") return;

      var base = elapsedBaseRef.current;
      var elapsed = base.elapsed + (performance.now() - base.capturedAt) / 1000;
      var m = START_MULT * Math.exp(GROWTH_RATE * elapsed);
      if (m > MAX_MULT) m = MAX_MULT;
      setLocalMultiplier(m);

      // Auto cashout
      if (autoTarget > 0 && !autoFiredRef.current && myBetSeenRef.current && myBetSeenRef.current.status === "active" && m >= autoTarget) {
        autoFiredRef.current = true;
        handleCashout(true);
      }

      // Candle building
      var t = Math.floor(Date.now() / 1000);
      var jitter = m * 0.008;
      if (!lastCandleRef.current || t > lastCandleRef.current.time) {
        var openVal = lastCandleRef.current ? lastCandleRef.current.close : m;
        var candle = { time: t, open: openVal, high: Math.max(openVal, m) + jitter, low: Math.min(openVal, m) - jitter, close: m };
        lastCandleRef.current = candle;
      } else {
        var c = lastCandleRef.current;
        c.close = m;
        c.high = Math.max(c.high, m + jitter);
        c.low = Math.min(c.low, m - jitter);
      }
      if (seriesRef.current) {
        try { seriesRef.current.update(lastCandleRef.current); } catch (e) {}
      }
    }, 20);
    return function () { clearInterval(tick); };
  }, [serverState, autoTarget]);

// Автоматически скрываем все статусные плашки через 5 секунд
useEffect(function () {
  if (!statusMsg && !outcomeMsg) return;

  var timer = setTimeout(function () {
    setStatusMsg(null);
    setOutcomeMsg(null);
  }, 5000);

  return function () {
    clearTimeout(timer);
  };
}, [statusMsg, outcomeMsg]);


  async function handlePlaceBet() {
    var amt = parseFloat(amountInput);
    if (!amt || amt <= 0 || isBetting) return;
    setIsBetting(true);
    setStatusMsg(null);
    setOutcomeMsg(null);
    try {
      await authFetch("/rocket/bet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt })
      });
      setStatusMsg("Bet placed — waiting for round to start");
      setStatusOk(true);
    } catch (err) {
      setStatusMsg(err.message);
      setStatusOk(false);
    } finally {
      setIsBetting(false);
    }
  }

  async function handleCashout(isAuto) {
    if (isCashing) return;
    setIsCashing(true);
    try {
      var result = await authFetch("/rocket/cashout", { method: "POST" });
      setOutcomeMsg({ ok: true, text: (isAuto ? "Auto cash-out at " : "Cashed out at ") + result.multiplier.toFixed(2) + "x — +$" + result.payout.toFixed(2) });
      if (myBetSeenRef.current) myBetSeenRef.current = Object.assign({}, myBetSeenRef.current, { status: "cashed_out" });
    } catch (err) {
      setStatusMsg(err.message);
      setStatusOk(false);
    } finally {
      setIsCashing(false);
    }
  }

  if (!serverState) {
    return <div className="rkt-page" ></div>;
  }

  var isBettingPhase = serverState.phase === "betting";
  var hasActiveBet = serverState.myBet && serverState.myBet.status === "active";
  var potentialPayout = hasActiveBet ? (serverState.myBet.amount * localMultiplier) : 0;
  var displayMultiplier = isBettingPhase ? START_MULT : localMultiplier;
  var gs = serverState.globalStats;
  var us = serverState.myStats;

  return (
    <div className="rkt-page">
      <div className="rkt-topbar">
        {/* <button className="rkt-icon-btn" onClick={() => navigate(-1)}><ChevronLeft /></button> */}
        <span className="rkt-title">Rocket</span>
        <div className="rkt-balance-chip">
          <WalletChipIcon />
          <span>{"$" + displayBalance.toFixed(2)}</span>
        </div>
      </div>

      <div className="rkt-mult-block">
        <div className="rkt-mult-row">
          <span className="rkt-mult-label">current coefficient</span>
          <span className={"rkt-status-pill " + (isBettingPhase ? "break" : "live")}>
            <span className="rkt-status-dot"></span>
            {isBettingPhase ? "Start soon" : "Game on"}
          </span>
        </div>
        <span className="rkt-mult-value">{displayMultiplier.toFixed(2) + "x"}</span>
      </div>

      <div className="rkt-chart-canvas" ref={containerRef}></div>

      {isBettingPhase ? (
        <div className="rkt-panel">
          <div className="rkt-break-card">
            {/* <div className="rkt-break-icon"></div> */}
            <div className="rkt-break-info">
              <span className="rkt-break-label">Break</span>
              <span className="rkt-break-timer">{formatCountdown(serverState.secondsRemaining)}</span>
            </div>
            {/* <span className="rkt-break-hint">Next round <br /> in {Math.ceil(serverState.secondsRemaining)} s</span> */}
          </div>

          {outcomeMsg && <div className={"rkt-outcome " + (outcomeMsg.ok ? "ok" : "err")}>{outcomeMsg.text}</div>}

          {!serverState.myBet && (
            <>
              <div className="rkt-field-label">Bid</div>
              <div className="rkt-amount-row">
                <input type="number" className="rkt-amount-input" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} />
                {/* <span className="rkt-amount-currency">$</span> */}
              </div>
              <div className="rkt-preset-row">
                {PRESETS.map(function (p) {
                  return <button key={p} className="rkt-preset-btn" onClick={() => setAmountInput(function (prev) { return ((parseFloat(prev) || 0) + p).toString(); })}>{"+" + p}</button>;
                })}
              </div>

              {statusMsg && <div className={"rkt-status " + (statusOk ? "ok" : "err")}>{statusMsg}</div>}

              <button className="rkt-primary-btn" disabled={isBetting} onClick={handlePlaceBet}>
                {isBetting ? "Sending..." : "Place a bet"}
              </button>

              <div className="rkt-auto-row">
                <span className="rkt-auto-label">Auto output</span>
                <select className="rkt-auto-select" value={autoTarget} onChange={(e) => setAutoTarget(parseFloat(e.target.value))}>
                  {AUTO_OPTIONS.map(function (o) { return <option key={o.value} value={o.value}>{o.label}</option>; })}
                </select>
              </div>
            </>
          )}

          {serverState.myBet && (
            <div className="rkt-waiting-card">
              <span>{"Bid $" + serverState.myBet.amount.toFixed(2) + " accepted"}</span>
              <span className="rkt-waiting-sub">The round will start soon.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="rkt-panel">
          {outcomeMsg && <div className={"rkt-outcome " + (outcomeMsg.ok ? "ok" : "err")}>{outcomeMsg.text}</div>}
          {statusMsg && <div className={"rkt-status " + (statusOk ? "ok" : "err")}>{statusMsg}</div>}

          {hasActiveBet ? (
            <button className="rkt-cashout-btn" disabled={isCashing} onClick={() => handleCashout(false)}>
              <span className="rkt-cashout-label">{isCashing ? "Conclusion" : "Exit"}</span>
              <span className="rkt-cashout-amount">{"+$" + potentialPayout.toFixed(2)}</span>
            </button>
          ) : (
            <button className="rkt-primary-btn disabled" disabled>The round is on</button>
          )}
        </div>
      )}

      <div className="rkt-stats-card">
        <div className="rkt-stats-row">
          <div className="rkt-stat-item">
            <span className="rkt-stat-label">Total bets</span>
            <span className="rkt-stat-value">{gs.totalBets.toLocaleString("ru-RU")}</span>
          </div>
          <div className="rkt-stat-item">
            <span className="rkt-stat-label">successful</span>
            <span className="rkt-stat-value">{gs.successBets.toLocaleString("ru-RU")} <span className="rkt-stat-sub">{gs.successRate.toFixed(1) + "%"}</span></span>
          </div>
          <div className="rkt-stat-item">
            <span className="rkt-stat-label">Max coefficient</span>
            <span className="rkt-stat-value">
              {/* {gs.maxMultiplier.toFixed(2) + "x"} */}
              5.00x
              </span>
          </div>
        </div>

        <div className="rkt-stats-divider"></div>

        <div className="rkt-mystats-header">
          <span>Your stat</span>
        </div>
        <div className="rkt-stats-row">
          <div className="rkt-stat-item">
            <span className="rkt-stat-label">Bet placed</span>
            <span className="rkt-stat-value">{us.totalBets}</span>
          </div>
          <div className="rkt-stat-item">
            <span className="rkt-stat-label">Win</span>
            <span className="rkt-stat-value">{us.winBets} <span className="rkt-stat-sub">{us.winRate.toFixed(1) + "%"}</span></span>
          </div>
          <div className="rkt-stat-item">
            <span className="rkt-stat-label">Profit</span>
            <span className={"rkt-stat-value " + (us.totalProfit >= 0 ? "pos" : "neg")}>{(us.totalProfit >= 0 ? "+$" : "-$") + Math.abs(us.totalProfit).toFixed(2)}</span>
          </div>
          <div className="rkt-stat-item">
            <span className="rkt-stat-label">Max winnings</span>
            <span className="rkt-stat-value">{"+$" + us.maxWin.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {serverState.recentCrashes.length > 0 && (
        <div className="rkt-recent-row">
          {serverState.recentCrashes.map(function (cp, idx) {
            return <span key={idx} className={"rkt-recent-chip " + (cp >= 2 ? "hi" : "lo")}>{cp.toFixed(2) + "x"}</span>;
          })}
        </div>
      )}
    </div>
  );
};

export default Rocket;