import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "./apiClient";
import { useWalletBalance } from "./useWallet";
import { useCardFunding } from "./useCardFunding";

var PRESETS = [10, 50, 100, 500];
// Зеркало flip_sql/flip.go: FlipDuration = 6s, PayoutMultiplier = 1.90
var FLIP_SECONDS = 6;
var PAYOUT = 1.9;

function ChevronLeft() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
}
function WalletChipIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><path d="M16 12h.01"></path></svg>);
}
function formatCountdown(seconds) {
  var s = Math.max(0, Math.ceil(seconds));
  var m = Math.floor(s / 60);
  var r = s % 60;
  return (m < 10 ? "0" + m : m) + ":" + (r < 10 ? "0" + r : r);
}
function formatMoney(v) {
  var n = Number(v);
  if (!isFinite(n)) n = 0;
  return "$" + n.toFixed(2);
}
function signedMoney(v) {
  var n = Number(v);
  if (!isFinite(n)) n = 0;
  return (n >= 0 ? "+$" : "-$") + Math.abs(n).toFixed(2);
}

const Flip = () => {
  const navigate = useNavigate();
  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var { activeCard } = useCardFunding();
  var displayBalance = activeCard ? activeCard.balance : wallet.balance;

  var [serverState, setServerState] = useState(null);
  var [amountInput, setAmountInput] = useState("10");
  var [choice, setChoice] = useState("red");
  var [isPlacing, setIsPlacing] = useState(false);
  var [notice, setNotice] = useState(null);
  var [visFace, setVisFace] = useState(null);
  var [nowTick, setNowTick] = useState(Date.now());
  var stateAtRef = useRef(Date.now());
  var prevRoundRef = useRef(null);

  // любой notice/status живёт ровно 5 секунд
  useEffect(function () {
    if (!notice) return;
    var t = setTimeout(function () { setNotice(null); }, 5000);
    return function () { clearTimeout(t); };
  }, [notice]);

  // ── Poll server state ────────────────────────────────────
  useEffect(function () {
    var cancelled = false;
    function poll() {
      authFetch("/flip/state").then(function (data) {
        if (cancelled || !data) return;
        stateAtRef.current = Date.now();
        setServerState(data);
      }).catch(function () {});
    }
    poll();
    var iv = setInterval(poll, 600);
    var tick = setInterval(function () { setNowTick(Date.now()); }, 100);
    return function () { cancelled = true; clearInterval(iv); clearInterval(tick); };
  }, []);

  // Грань монеты: во время flipping не обновляем — старт подброса = прошлый исход
  useEffect(function () {
    if (!serverState) return;
    if (serverState.phase !== "flipping") {
      setVisFace(serverState.lastOutcome === "black" ? "black" : "red");
    }
  }, [serverState]);

  // ── Итог раунда: ловим смену roundId (myBet уже от нового раунда) ──
  useEffect(function () {
    if (!serverState) return;
    var prev = prevRoundRef.current;
    if (prev && prev.roundId !== serverState.roundId && prev.myBet && prev.myBet.status && prev.myBet.status !== "active") {
      var mb = prev.myBet;
      if (mb.status === "won") {
        setNotice({ kind: "won", text: "YOU WON +" + formatMoney(mb.payout || 0) });
      } else {
        setNotice({ kind: "lost", text: "YOU LOST -" + formatMoney(mb.amount || 0) });
      }
      refreshWallet();
    }
    prevRoundRef.current = serverState;
  }, [serverState]);

  async function handlePlaceBet() {
    var amt = parseFloat(amountInput);
    if (!amt || amt <= 0 || isPlacing) return;
    var bal = typeof displayBalance === "number" ? displayBalance : null;
    if (bal !== null && amt > bal) {
      setNotice({ kind: "error", text: "INSUFFICIENT BALANCE" });
      return;
    }
    setIsPlacing(true);
    try {
      await authFetch("/flip/bet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, choice: choice })
      });
      setNotice({ kind: "info", text: "BET PLACED " + formatMoney(amt) + " ON " + choice.toUpperCase() });
      refreshWallet();
    } catch (err) {
      setNotice({ kind: "error", text: (err && err.message) ? err.message : "BET FAILED" });
    } finally {
      setIsPlacing(false);
    }
  }

  if (!serverState) {
    return <div className="flp-page"></div>;
  }

  var phase = serverState.phase;
  var isBetting = phase === "betting";
  var isFlipping = phase === "flipping";
  var liveRemaining = Math.max(0, (serverState.secondsRemaining || 0) - (nowTick - stateAtRef.current) / 1000);

  var lastOutcome = serverState.lastOutcome === "black" ? "black" : "red";
  var sceneOutcome = isFlipping ? (serverState.outcome === "red" ? "red" : "black") : lastOutcome;
  var startFace = isFlipping ? (visFace || lastOutcome) : lastOutcome;
  // финальный поворот строго по исходу сервера: честные 50/50
  var delta = (startFace === "black") === (sceneOutcome === "black") ? 0 : 180;
  var turns = 1800 + delta;
  var flipElapsed = isFlipping ? Math.min(FLIP_SECONDS, Math.max(0, FLIP_SECONDS - liveRemaining)) : 0;

  var sceneStyle = {
    "--flp-start-y": startFace === "black" ? "180deg" : "0deg",
    "--flp-turns": turns + "deg",
    "--flp-delay": isFlipping ? "-" + flipElapsed.toFixed(2) + "s" : "0s"
  };

  var myBet = serverState.myBet;
  var hasBet = !!(myBet && myBet.status === "active");
  var showWinGlow = !!(notice && notice.kind === "won");
  var amt = parseFloat(amountInput) || 0;
  var potentialWin = amt * PAYOUT;

  var waitingTitle = "ROUND SETTLED";
  var waitingSub = "NEXT FLIP SOON";
  if (isBetting && hasBet) {
    waitingTitle = "BET PLACED " + formatMoney(myBet.amount) + " ON " + String(myBet.choice).toUpperCase();
    waitingSub = "FLIP STARTS IN " + formatCountdown(liveRemaining);
  } else if (isFlipping) {
    waitingTitle = hasBet
      ? "IN FLIGHT " + formatMoney(myBet.amount) + " ON " + String(myBet.choice).toUpperCase()
      : "FLIP IN PROGRESS";
    waitingSub = "RESULT IN " + formatCountdown(liveRemaining);
  }

  var gs = serverState.globalStats || {};
  var us = serverState.myStats || {};

  return (
    <div className="flp-page">
      <div className="flp-topbar">
        <span className="rkt-title">Flip</span>
        <div className="rkt-balance-chip">
          <WalletChipIcon />
          <span>{"$" + displayBalance.toFixed(2)}</span>
        </div>
      </div>

      <div className="flp-status-row">
        <span className={"flp-phase" + (isFlipping ? " live" : "")}>
          {isFlipping ? "FLIPPING" : isBetting ? "ACCEPTING BETS" : "ROUND SETTLED"}
        </span>
        <span className="flp-countdown">{formatCountdown(liveRemaining)}</span>
      </div>

      <div className="flp-scene">
        <div className={"flp-glow" + (showWinGlow ? " on" : "")}></div>
        <div className="flp-stage" style={sceneStyle}>
          <div
            key={serverState.roundId + "-" + sceneOutcome}
            className={"flp-coin" + (isFlipping ? " flipping" : " resting")}
          >
            <div className="flp-face flp-face-red"><span>RED</span></div>
            <div className="flp-face flp-face-black"><span>BLACK</span></div>
          </div>
        </div>
        <div className="flp-shadow"></div>
      </div>

      <div className="flp-notice-slot">
        {notice && <div className={"flp-notice " + notice.kind}>{notice.text}</div>}
      </div>

    <div className="pxl-panel">



  <div className="flp-choice-row">
    <button
      className={"flp-choice red" + (choice === "red" ? " active" : "")}
      onClick={() => setChoice("red")}
    >
      RED
    </button>

    <button
      className={"flp-choice black" + (choice === "black" ? " active" : "")}
      onClick={() => setChoice("black")}
    >
      BLACK
    </button>
  </div>

  <div className="flp-mult">
    WIN PAYS 1.90x
  </div>

  {isBetting && !hasBet ? (
    <>
      <div className="flp-field-label">
        BET AMOUNT
      </div>

      <div className="flp-amount-row">
        <input
          type="number"
          className="flp-amount-input"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
        />
        <span className="flp-amount-currency">$</span>
      </div>

      <div className="flp-preset-row">
        {PRESETS.map((p) => (
          <button
            key={p}
            className="flp-preset-btn"
            onClick={() =>
              setAmountInput((prev) =>
                ((parseFloat(prev) || 0) + p).toString()
              )
            }
          >
            {"+" + p}
          </button>
        ))}
      </div>

      <div className="flp-win-line">
        <span>POTENTIAL WIN</span>
        <span className="flp-win-val">
          {formatMoney(potentialWin)}
        </span>
      </div>

      <button
        className={"flp-primary " + choice}
        disabled={isPlacing}
        onClick={handlePlaceBet}
      >
        {isPlacing ? "PLACING..." : "PLACE BET"}
      </button>
    </>
  ) : (
    <div className="flp-waiting">
      <span className="flp-waiting-title">
        {waitingTitle}
      </span>

      <span className="flp-waiting-sub">
        {waitingSub}
      </span>
    </div>
  )}

</div>
<div className="rkt-stats-card">
  <div className="pxl-stats-row">
    <div className="pxl-stat-item">
      <span className="pxl-stat-label">Total Bets</span>
      <span className="pxl-stat-value">
        {(gs.totalBets || 0).toLocaleString("en-US")}
      </span>
    </div>

    <div className="pxl-stat-item">
      <span className="pxl-stat-label">Win Rate</span>
      <span className="pxl-stat-value">
        {Number(gs.winRate || 0).toFixed(1) + "%"}
      </span>
    </div>

    <div className="pxl-stat-item">
      <span className="pxl-stat-label">Max Payout</span>
      <span className="pxl-stat-value">
        {formatMoney(gs.maxPayout || 0)}
      </span>
    </div>
  </div>

  <div className="pxl-stats-divider"></div>

  <div className="pxl-mystats-header">Your Statistics</div>

  <div className="pxl-stats-row">
    <div className="pxl-stat-item">
      <span className="pxl-stat-label">Rounds</span>
      <span className="pxl-stat-value">
        {(us.totalBets || 0).toLocaleString("en-US")}
      </span>
    </div>

    <div className="pxl-stat-item">
      <span className="pxl-stat-label">Won</span>
      <span className="pxl-stat-value">
        {(us.wonBets || 0).toLocaleString("en-US")}
      </span>
    </div>
  </div>

  <div className="pxl-stats-row">
    <div className="pxl-stat-item">
      <span className="pxl-stat-label">Win Rate</span>
      <span className="pxl-stat-value">
        {Number(us.winRate || 0).toFixed(1) + "%"}
      </span>
    </div>

    <div className="pxl-stat-item">
      <span className="pxl-stat-label">Profit</span>
      <span
        className={
          "pxl-stat-value " +
          ((us.totalProfit || 0) >= 0 ? "pos" : "neg")
        }
      >
        {signedMoney(us.totalProfit || 0)}
      </span>
    </div>
  </div>

  <div className="pxl-stats-row">
    <div className="pxl-stat-item">
      <span className="pxl-stat-label">Max Win</span>
      <span className="pxl-stat-value">
        {formatMoney(us.maxWin || 0)}
      </span>
    </div>

    <div className="pxl-stat-item">
      <span className="pxl-stat-label">Net Profit</span>
      <span
        className={
          "pxl-stat-value " +
          ((us.totalProfit || 0) >= 0 ? "pos" : "neg")
        }
      >
        {signedMoney(us.totalProfit || 0)}
      </span>
    </div>
  </div>
</div>
    </div>
  );
};
export default Flip;