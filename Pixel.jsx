import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "./apiClient";
import { useWalletBalance } from "./useWallet";
import { useCardFunding } from "./useCardFunding";

var PRESETS = [10, 50, 100, 500];
var HEART_BITMAP = ["01010", "11111", "11111", "01110", "00100"];
// Зеркало pixel_sql/config.go: RoundDuration / BettingDuration / RevealDuration
var ROUND_SECONDS = 20;
var BETTING_SECONDS = 10;
var REVEAL_SECONDS = 3;

function ClockIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 16 14"></polyline></svg>);
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
function boardFromServer(roundId, mb) {
  var settled = mb.status && mb.status !== "active";
  return {
    roundId: roundId,
    amount: mb.amount || 0,
    livesRemaining: mb.livesRemaining || 0,
    revealedCells: mb.revealedCells || [],
    minesHit: [],
    safeCellsCount: mb.safeCellsCount || 0,
    currentMultiplier: mb.currentMultiplier || 1,
    currentPayout: settled && mb.payout != null ? mb.payout : (mb.currentPayout || 0),
    status: mb.status,
    minePositions: mb.minePositions || []
  };
}
function PixelHeart(props) {
  var rects = [];
  for (var y = 0; y < HEART_BITMAP.length; y++) {
    for (var x = 0; x < HEART_BITMAP[y].length; x++) {
      if (HEART_BITMAP[y].charAt(x) === "1") {
        rects.push(<rect key={x + "-" + y} x={x} y={y} width={1} height={1}></rect>);
      }
    }
  }
  return (
    <svg className={"pxl-heart" + (props.filled ? "" : " lost")} width="18" height="18" viewBox="0 0 5 5" fill="currentColor" shapeRendering="crispEdges">{rects}</svg>
  );
}
const Pixel = () => {
  const navigate = useNavigate();
  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var { activeCard } = useCardFunding();
  var displayBalance = activeCard ? activeCard.balance : wallet.balance;
  var [serverState, setServerState] = useState(null);
  var [amountInput, setAmountInput] = useState("10");
  var [isBetting, setIsBetting] = useState(false);
  var [isCashing, setIsCashing] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);
  var [outcomeMsg, setOutcomeMsg] = useState(null);
  useEffect(() => {
    if (!statusMsg) return;
    const t = setTimeout(() => {
      setStatusMsg(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [statusMsg]);
  useEffect(() => {
    if (!outcomeMsg) return;
    const t = setTimeout(() => {
      setOutcomeMsg(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [outcomeMsg]);
  var [board, setBoard] = useState(null);
  var [pendingCells, setPendingCells] = useState([]);
  var [showDefeat, setShowDefeat] = useState(false);
  var [nowTick, setNowTick] = useState(Date.now());
  var boardRef = useRef(null);
  var pendingRef = useRef([]);
  var defeatTimerRef = useRef(null);
  var lastRoundRef = useRef({ roundId: null, phase: null });
  var stateAtRef = useRef(Date.now());
  useEffect(function () { boardRef.current = board; }, [board]);
  // ── Poll server state ────────────────────────────────────
  useEffect(function () {
    var cancelled = false;
    function poll() {
      authFetch("/pixel/state").then(function (data) {
        if (cancelled) return;
        stateAtRef.current = Date.now();
        setServerState(data);
      }).catch(function () {});
    }
    poll();
    var iv = setInterval(poll, 600);
    return function () { cancelled = true; clearInterval(iv); };
  }, []);
  // ── Локальный тикер для плавного отсчёта ─────────────────
  useEffect(function () {
    var iv = setInterval(function () { setNowTick(Date.now()); }, 250);
    return function () { clearInterval(iv); };
  }, []);
  useEffect(function () {
    return function () { if (defeatTimerRef.current) clearTimeout(defeatTimerRef.current); };
  }, []);
  // ── Реакция на состояние сервера ────────────────────────
  useEffect(function () {
    if (!serverState) return;
    var prev = lastRoundRef.current;
    var roundChanged = prev.roundId !== null && prev.roundId !== serverState.roundId;
    if (roundChanged) {
      var old = boardRef.current;
      if (defeatTimerRef.current) { clearTimeout(defeatTimerRef.current); defeatTimerRef.current = null; }
      setShowDefeat(false);
      pendingRef.current = [];
      setPendingCells([]);
      if (old && old.roundId === prev.roundId && old.status === "active") {
        setOutcomeMsg({ ok: true, text: "Round ended +$" + old.currentPayout.toFixed(2) });
        refreshWallet();
      }
      setBoard(null);
    }
    var mb = serverState.myBoard;
    var cur = boardRef.current;
    if (mb && mb.exists) {
      var fresh = boardFromServer(serverState.roundId, mb);
      if (!cur || cur.roundId !== fresh.roundId) {
        setBoard(fresh);
      } else {
        var localProgress = cur.safeCellsCount + cur.minesHit.length;
        var serverProgress = fresh.safeCellsCount + (serverState.config.livesCount - fresh.livesRemaining);
        if (serverProgress >= localProgress) {
          fresh.minesHit = cur.minesHit;
          if (!fresh.minePositions.length) fresh.minePositions = cur.minePositions;
          setBoard(fresh);
        }
      }
    } else if (cur && cur.roundId !== serverState.roundId) {
      setBoard(null);
    }
    lastRoundRef.current = { roundId: serverState.roundId, phase: serverState.phase };
  }, [serverState]);
  async function handlePlaceBet() {
    var amt = parseFloat(amountInput);
    if (!amt || amt <= 0 || isBetting) return;
    var bal = typeof displayBalance === "number" ? displayBalance : null;
    if (bal !== null && amt > bal) {
      setStatusMsg("balance");
      setStatusOk(false);
      return;
    }
    setIsBetting(true);
    setStatusMsg(null);
    setOutcomeMsg(null);
    try {
      await authFetch("/pixel/bet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt })
      });
      setStatusMsg("Good game!");
      setStatusOk(true);
      refreshWallet();
    } catch (err) {
      setStatusMsg(err.message);
      setStatusOk(false);
    } finally {
      setIsBetting(false);
    }
  }
  async function handleCashout() {
    if (isCashing) return;
    setIsCashing(true);
    try {
      var result = await authFetch("/pixel/cashout", { method: "POST" });
      setBoard(function (prev) {
        if (!prev) return prev;
        return Object.assign({}, prev, {
          status: "cashed_out",
          currentPayout: result.payout,
          minePositions: result.minePositions || prev.minePositions
        });
      });
      setOutcomeMsg({ ok: true, text: "Exit — +$" + result.payout.toFixed(2) });
      refreshWallet();
    } catch (err) {
      setStatusMsg(err.message);
      setStatusOk(false);
    } finally {
      setIsCashing(false);
    }
  }
  async function handleReveal(cellIndex) {
    var b = boardRef.current;
    if (!serverState || serverState.phase !== "running") return;
    if (!b || b.status !== "active") return;
    if (b.revealedCells.indexOf(cellIndex) !== -1) return;
    if (pendingRef.current.indexOf(cellIndex) !== -1) return;
    var roundAtClick = b.roundId;
    pendingRef.current = pendingRef.current.concat([cellIndex]);
    setPendingCells(pendingRef.current.slice());
    try {
      var res = await authFetch("/pixel/reveal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cellIndex: cellIndex })
      });
      setBoard(function (prev) {
        if (!prev || prev.roundId !== roundAtClick) return prev;
        var next = Object.assign({}, prev, {
          revealedCells: prev.revealedCells.concat([cellIndex]),
          livesRemaining: res.livesRemaining,
          safeCellsCount: res.safeCellsCount,
          currentMultiplier: res.currentMultiplier,
          currentPayout: res.gameOver ? 0 : res.currentPayout,
          minesHit: res.isMine ? prev.minesHit.concat([cellIndex]) : prev.minesHit
        });
        if (res.gameOver) {
          next.status = "lost";
          next.minePositions = res.minePositions || prev.minePositions;
        }
        return next;
      });
      if (res.gameOver) {
        if (defeatTimerRef.current) clearTimeout(defeatTimerRef.current);
        setShowDefeat(false);
        defeatTimerRef.current = setTimeout(function () {
          var lost = boardRef.current;
          var lostAmount = lost ? lost.amount : 0;
          setShowDefeat(true);
          setOutcomeMsg({ ok: false, text: "Loss $" + lostAmount.toFixed(2) });
        }, REVEAL_SECONDS * 1000);
      }
    } catch (err) {
      setStatusMsg(err.message);
      setStatusOk(false);
    } finally {
      pendingRef.current = pendingRef.current.filter(function (c) { return c !== cellIndex; });
      setPendingCells(pendingRef.current.slice());
    }
  }
  if (!serverState) {
    return <div className="pxl-page"></div>;
  }
  var config = serverState.config;
  var cols = config.gridCols;
  var rows = config.gridRows;
  var livesCount = config.livesCount;
  var liveRemaining = Math.max(0, serverState.secondsRemaining - (nowTick - stateAtRef.current) / 1000);
  var isBettingPhase = serverState.phase === "betting";
  var boardActive = board && board.status === "active";
  var boardLost = board && board.status === "lost";
  var boardSettled = board && (board.status === "cashed_out" || board.status === "expired");
  var canReveal = !isBettingPhase && boardActive && !showDefeat;
  var heartsFilled = board ? Math.max(0, Math.min(livesCount, board.livesRemaining)) : 0;
  var displayPayout = 0;
  if (boardActive || boardSettled) displayPayout = board.currentPayout;
  var headSub = isBettingPhase ? "accept bet" : "Round started";
  if (boardActive) headSub = "×" + board.currentMultiplier.toFixed(2) + " · lucky slots: " + board.safeCellsCount;
  else if (boardSettled) headSub = "Exit: +$" + board.currentPayout.toFixed(2);
  else if (boardLost) headSub = "loss $" + board.amount.toFixed(2);
  var revealedSet = board ? board.revealedCells : [];
  var mineHitSet = board ? board.minesHit : [];
  var ghostMineSet = (board && board.status !== "active") ? board.minePositions : [];
  var preRevealedMineSet = [];
  if (board && board.minePositions && board.minePositions.length) {
    for (var _k = 0; _k < revealedSet.length; _k++) {
      var _c = revealedSet[_k];
      if (board.minePositions.indexOf(_c) !== -1 && mineHitSet.indexOf(_c) === -1) {
        preRevealedMineSet.push(_c);
      }
    }
  }
  var timerPercent = isBettingPhase ? (liveRemaining / BETTING_SECONDS) * 100 : (liveRemaining / ROUND_SECONDS) * 100;
  if (timerPercent > 100) timerPercent = 100;
  if (timerPercent < 0) timerPercent = 0;
  var gs = serverState.globalStats;
  var us = serverState.myStats;
  return (
   <div className="rkt-page">
  <div className="rkt-topbar">
    <span className="rkt-title">Pixel</span>
    <div className="rkt-balance-chip">
      <WalletChipIcon />
      <span>{"$" + displayBalance.toFixed(2)}</span>
    </div>
  </div>

  <div className="pxl-head">
    <div className="pxl-head-row">
      <span className="pxl-head-label">Current Profit</span>
      <span className={"rkt-status-pill " + (isBettingPhase ? "break" : "live")}>
        <span className="pxl-status-dot"></span>
        {isBettingPhase ? "Soon" : "Game On"}
      </span>
    </div>

    <div className="pxl-value-row">
      <span className="pxl-value">{"$" + displayPayout.toFixed(2)}</span>
      <div className="pxl-hearts">
        {Array.from({ length: livesCount }).map(function (_, i) {
          return <PixelHeart key={i} filled={i < heartsFilled} />;
        })}
      </div>
    </div>

    <span className="pxl-head-sub">{headSub}</span>
  </div>

  <div className="pxl-grid-wrap">
    <div
      className="pxl-grid"
      style={{ gridTemplateColumns: "repeat(" + cols + ", 1fr)" }}
    >
      {Array.from({ length: cols * rows }).map(function (_, i) {
        var cls = "pxl-cell";
        var revealed = revealedSet.indexOf(i) !== -1;
        var isMineHit = mineHitSet.indexOf(i) !== -1;
        var isPreMine = preRevealedMineSet.indexOf(i) !== -1;
        var isGhost = !revealed && ghostMineSet.indexOf(i) !== -1;
        var isPending = pendingCells.indexOf(i) !== -1;

        if (revealed) cls += isMineHit ? " mine" : (isPreMine ? " pre-mine" : " safe");
        else if (isGhost) cls += " ghost-mine";
        else if (isPending) cls += " pending";

        var clickable = canReveal && !revealed && !isPending;

        return (
          <button
            key={i}
            className={cls}
            disabled={!clickable}
            onClick={() => handleReveal(i)}
          />
        );
      })}
    </div>

    {showDefeat && (
      <div className="pxl-defeat-overlay">
        <span className="pxl-defeat-title">DEFEAT</span>
        <span className="pxl-defeat-sub">
          {"Loss $" + (board ? board.amount.toFixed(2) : "0.00")}
        </span>
      </div>
    )}
  </div>

  <div className="pxl-grid-meta">
    <span>{"Grid " + cols + "×" + rows}</span>
    <span>
      {"Mines " +
        config.mineCount +
        " · per cell +" +
        config.percentPerCell +
        "%"}
    </span>
  </div>

  {!isBettingPhase && (
    <div className="pxl-timer-row">
      <div className="pxl-timer-top">
        <span className="pxl-timer-label">Round Ends In</span>
        <span className="pxl-timer-value">
          {formatCountdown(liveRemaining)}
        </span>
      </div>

      <div className="pxl-timer-bar">
        <div
          className="pxl-timer-fill"
          style={{ width: timerPercent + "%" }}
        />
      </div>
    </div>
  )}

  <div className="pxl-panel">
    {outcomeMsg && (
      <div className={"pxl-outcome " + (outcomeMsg.ok ? "ok" : "err")}>
        {outcomeMsg.text}
      </div>
    )}

    {statusMsg && (
      <div className={"pxl-status " + (statusOk ? "ok" : "err")}>
        {statusMsg}
      </div>
    )}

    {isBettingPhase && (
      <>
        <div className="rkt-break-card">
          <div className="rkt-break-icon">
            <ClockIcon />
          </div>

          <div className="rkt-break-info">
            <span className="rkt-break-label">Break</span>
            <span className="rkt-break-timer">
              {formatCountdown(liveRemaining)}
            </span>
          </div>
        </div>

        {board ? (
          <div className="rkt-waiting-card">
            <span>{"Bet $" + board.amount.toFixed(2) + " accepted"}</span>
            <span className="rkt-waiting-sub">
              Round starts in {Math.ceil(liveRemaining)} sec
            </span>
          </div>
        ) : (
          <>
            <div className="rkt-field-label">Bet</div>

            <div className="rkt-amount-row">
              <input
                type="number"
                className="pxl-amount-input"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
              <span className="pxl-amount-currency">$</span>
            </div>

            <div className="rkt-preset-row">
              {PRESETS.map(function (p) {
                return (
                  <button
                    key={p}
                    className="rkt-preset-btn"
                    onClick={() =>
                      setAmountInput(function (prev) {
                        return ((parseFloat(prev) || 0) + p).toString();
                      })
                    }
                  >
                    {"+" + p}
                  </button>
                );
              })}
            </div>

            <button
              className="rkt-primary-btn"
              disabled={isBetting}
              onClick={handlePlaceBet}
            >
              {isBetting ? "Submitting..." : "Place Bet"}
            </button>
          </>
        )}
      </>
    )}

    {!isBettingPhase && (
      <>
        {boardActive && (
          <button
            className="rkt-cashout-btn"
            disabled={isCashing}
            onClick={handleCashout}
          >
            <span className="rkt-cashout-label">
              {isCashing ? "Cashing Out..." : "Cash Out"}
            </span>

            <span className="rkt-cashout-amount">
              {"+$" + board.currentPayout.toFixed(2)}
            </span>
          </button>
        )}

        {boardLost && !showDefeat && (
          <div className="rkt-waiting-card">
            <span>Viewing Final Board</span>
            <span className="pxl-waiting-sub">
              {REVEAL_SECONDS} seconds remaining
            </span>
          </div>
        )}

        {!boardActive && (boardLost ? showDefeat : true) && (
          <button className="rkt-primary-btn disabled" disabled>
            {boardLost ? "Defeat" : "Round Active"}
          </button>
        )}
      </>
    )}
  </div>

  <div className="rkt-stats-card">
    <div className="pxl-stats-row">
      <div className="pxl-stat-item">
        <span className="pxl-stat-label">Total Games</span>
        <span className="pxl-stat-value">
          {gs.totalGames.toLocaleString("en-US")}
        </span>
      </div>

      <div className="pxl-stat-item">
        <span className="pxl-stat-label">Success Rate</span>
        <span className="pxl-stat-value">
          {gs.successRate.toFixed(1) + "%"}
        </span>
      </div>

      <div className="pxl-stat-item">
        <span className="pxl-stat-label">Max Payout</span>
        <span className="pxl-stat-value">
          {"$" + gs.maxPayout.toFixed(2)}
        </span>
      </div>
    </div>

    <div className="pxl-stats-divider"></div>

    <div className="pxl-mystats-header">Your Statistics</div>

    <div className="pxl-stats-row">
      <div className="pxl-stat-item">
        <span className="pxl-stat-label">Cells Opened</span>
        <span className="pxl-stat-value">
          {us.totalCellsOpened.toLocaleString("en-US")}
        </span>
      </div>

      <div className="pxl-stat-item">
        <span className="pxl-stat-label">Safe Cells</span>
        <span className="pxl-stat-value">
          {us.safeCellsOpened.toLocaleString("en-US")}
        </span>
      </div>
    </div>

    <div className="pxl-stats-row">
      <div className="pxl-stat-item">
        <span className="pxl-stat-label">Wins</span>
        <span className="pxl-stat-value">
          {us.winRate.toFixed(1) + "%"}
          <span className="pxl-stat-sub">
            {us.gamesWon + " of " + us.totalGames}
          </span>
        </span>
      </div>

      <div className="pxl-stat-item">
        <span className="pxl-stat-label">Profit</span>
        <span
          className={
            "pxl-stat-value " + (us.totalProfit >= 0 ? "pos" : "neg")
          }
        >
          {(us.totalProfit >= 0 ? "+$" : "-$") +
            Math.abs(us.totalProfit).toFixed(2)}
        </span>
      </div>
    </div>

    <div className="pxl-stats-row">
      <div className="pxl-stat-item">
        <span className="pxl-stat-label">Max Win</span>
        <span className="pxl-stat-value">
          {"$" + us.maxWin.toFixed(2)}
        </span>
      </div>

      <div className="pxl-stat-item">
        <span className="pxl-stat-label">Mines on Board</span>
        <span className="pxl-stat-value">{config.mineCount}</span>
      </div>
    </div>
  </div>
</div>
  );
};
export default Pixel;