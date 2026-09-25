import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletBalance } from "./useWallet";
import { useRewards } from "./useRewards";

function GiftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1"></rect>
      <path d="M12 8v13"></path>
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"></path>
    </svg>
  );
}

function formatWait(seconds) {
  var s = Math.max(0, Math.ceil(seconds));
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var r = s % 60;
  return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (r < 10 ? "0" + r : r);
}

function compLabel(c) {
  if (c.kind === "usdt") return "+$" + c.value.toFixed(2);
  if (c.kind === "lavx") return "LAVX " + (c.value % 1 === 0 ? c.value.toFixed(0) : c.value.toFixed(2));
  if (c.kind === "voucher") return "VOUCHER $" + c.value.toFixed(0);
  if (c.kind === "ref_xp") return "REF XP " + c.value.toFixed(0);
  if (c.kind === "pass_xp") return "PASS XP " + c.value.toFixed(0);
  return "";
}

const Rewards = () => {
  const navigate = useNavigate();
  var { refresh: refreshWallet } = useWalletBalance();
  var { state, claiming, claim, refresh, stateAtRef } = useRewards();
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);
  var [outcomeMsg, setOutcomeMsg] = useState(null);
  var [nowTick, setNowTick] = useState(Date.now());

  useEffect(function () {
    var iv = setInterval(function () { setNowTick(Date.now()); }, 1000);
    return function () { clearInterval(iv); };
  }, []);

  useEffect(function () {
    if (!statusMsg) return;
    var t = setTimeout(function () { setStatusMsg(null); }, 4000);
    return function () { clearTimeout(t); };
  }, [statusMsg]);

  useEffect(function () {
    if (!outcomeMsg) return;
    var t = setTimeout(function () { setOutcomeMsg(null); }, 5000);
    return function () { clearTimeout(t); };
  }, [outcomeMsg]);

  var cooldownLeft = 0;
  if (state && state.secondsRemaining > 0) {
    cooldownLeft = Math.max(0, state.secondsRemaining - (nowTick - stateAtRef.current) / 1000);
  }

  var noTrackView = state && state.track === "none" && !state.finishedTrack;
  var finishedView = state && (!!state.finishedTrack || (state.track !== "none" && state.nextDay === 0));
  var activeTrack = state ? (state.track === "none" ? state.finishedTrack : state.track) : "";
  var isPro = activeTrack === "pro";
  var trackTitle = isPro ? "PRO TRACK" : "START TRACK";

  var canClick = false;
  if (state && state.track !== "none" && state.nextDay > 0) {
    canClick = state.canClaim || cooldownLeft <= 0;
  }

  var nextLabel = "";
  if (state && state.nextReward && state.nextReward.length) {
    var parts = [];
    for (var i = 0; i < state.nextReward.length; i++) {
      parts.push(compLabel(state.nextReward[i]));
    }
    nextLabel = parts.join(" · ");
  }

  async function handleClaim() {
    if (claiming || !canClick) return;
    try {
      var result = await claim();
      var grantedParts = [];
      for (var i = 0; i < result.granted.length; i++) {
        grantedParts.push(compLabel(result.granted[i]));
      }
      setOutcomeMsg({ ok: true, text: "Day " + result.day + " claimed: " + grantedParts.join(" · ") });
      refreshWallet();
    } catch (err) {
      setStatusMsg(err.message);
      setStatusOk(false);
      refresh().catch(function () {});
    }
  }

  if (!state) {
    return <div className="rwd-page"></div>;
  }

  var days = state.days || [];
  var stats = state.stats;
  var progressPercent = stats && stats.totalDays > 0 ? (stats.claimedDays / stats.totalDays) * 100 : 0;

  return (
    <div className="rwd-page">
      <div className="rwd-topbar">
        <span className="rwd-title">Rewards</span>
        <span className={"rwd-track-chip " + (isPro ? "pro" : "")}>
          <GiftIcon />
          <span>{noTrackView ? "NO TRACK" : trackTitle}</span>
        </span>
      </div>

      {noTrackView ? (
        <div className="rwd-empty-card">
          <div className="rwd-empty-icon"><GiftIcon /></div>
          <span className="rwd-empty-title">No active track</span>
          <span className="rwd-empty-sub">Daily rewards will appear here once a track is active</span>
        </div>
      ) : (
        <>
          <div className="rwd-head">
            <div className="rwd-head-row">
              <span className={"rwd-track-name " + (isPro ? "pro" : "")}>{trackTitle}</span>
              <span className="rwd-track-days">{stats.claimedDays + " / " + stats.totalDays}</span>
            </div>
            <div className="rwd-progress-bar">
              <div className="rwd-progress-fill" style={{ width: progressPercent + "%" }} />
            </div>
            <span className="rwd-head-sub">
              {finishedView ? "Track completed" : "New reward every 24 hours"}
            </span>
          </div>

          <div className="rwd-grid">
            {days.map(function (d) {
              var cls = "rwd-cell";
              if (d.day === days.length) cls += " finale";
              if (d.claimed) cls += " claimed";
              if (!d.claimed && !finishedView && state.nextDay === d.day) {
                cls += canClick ? " next" : " locked";
              }
              return (
                <div key={d.day} className={cls}>
                  <span className="rwd-cell-day">{d.day}</span>
                  <div className="rwd-cell-body">
                    {(d.components || []).map(function (c, ci) {
                      return (
                        <span key={ci} className={"rwd-comp " + c.kind}>{compLabel(c)}</span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {finishedView ? (
            <div className="rwd-finished-card">
              <span className="rwd-finished-title">Track finished</span>
              <span className="rwd-finished-sub">All 30 days completed</span>
            </div>
          ) : (
            <>
              <div className="rwd-timer-row">
                <span className="rwd-timer-label">
                  {canClick ? "Reward ready" : "Next reward in"}
                </span>
                <span className="rwd-timer-value">
                  {canClick ? "NOW" : formatWait(cooldownLeft)}
                </span>
              </div>

              <button
                className="rwd-claim-btn"
                disabled={!canClick || claiming}
                onClick={handleClaim}
              >
                {claiming
                  ? "Claiming..."
                  : canClick
                    ? "Claim Day " + state.nextDay + (nextLabel ? " · " + nextLabel : "")
                    : "Locked"}
              </button>
            </>
          )}

          <div className="rwd-stats-card">
            <div className="rwd-stats-row">
              <div className="rwd-stat">
                <span className="rwd-stat-label">Days claimed</span>
                <span className="rwd-stat-value">{stats.claimedDays + " / " + stats.totalDays}</span>
              </div>
              <div className="rwd-stat">
                <span className="rwd-stat-label">Earned</span>
                <span className="rwd-stat-value">{"$" + stats.earnedUsdt.toFixed(2)}</span>
              </div>
            </div>
            <div className="rwd-stats-row">
              <div className="rwd-stat">
                <span className="rwd-stat-label">LAVX earned</span>
                <span className="rwd-stat-value">{stats.earnedLavx.toFixed(0)}</span>
              </div>
              <div className="rwd-stat">
                <span className="rwd-stat-label">Vouchers</span>
                <span className="rwd-stat-value">{stats.vouchersGranted}</span>
              </div>
            </div>
            <div className="rwd-stats-row">
              <div className="rwd-stat">
                <span className="rwd-stat-label">Referral XP</span>
                <span className="rwd-stat-value">{stats.earnedRefXp}</span>
              </div>
              <div className="rwd-stat">
                <span className="rwd-stat-label">Pass XP</span>
                <span className="rwd-stat-value">{stats.earnedPassXp}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {outcomeMsg && (
        <div className={"rwd-outcome " + (outcomeMsg.ok ? "ok" : "err")}>{outcomeMsg.text}</div>
      )}
      {statusMsg && (
        <div className={"rwd-status " + (statusOk ? "ok" : "err")}>{statusMsg}</div>
      )}
    </div>
  );
};

export default Rewards;