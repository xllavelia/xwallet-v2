import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBattlePass, claimLevel, devAddXp } from "./useBattlePass";

function describeComponent(c) {
  switch (c.kind) {
    case "usdt": return "+$" + c.value + " USDT";
    case "ref_xp": return "+" + c.value + " Referral XP";
    case "lavx": return "+" + c.value + " LAVX";
    case "voucher_fee": return "$" + c.value + " fee-free (" + c.days + "d)";
    case "fee_boost": return "-" + (c.value / 10).toFixed(1) + "% fee (" + c.days + "d)";
    case "xp_boost": return "+" + c.value + "% BP XP (" + c.days + "d)";
    case "case": return c.label.charAt(0).toUpperCase() + c.label.slice(1) + " Case";
    case "status": return "Status: " + c.label.toUpperCase();
    default: return "";
  }
}

var TRACK_INFO = {
  pro: { name: "Pro Pass", levels: 10, tagline: "5 USDT, fee vouchers, and an Epic Case along the way." },
  prime: { name: "Prime Pass", levels: 14, tagline: "Bigger drops, XP boosters, and a Mythic Case finale." },
  star: { name: "Star Pass", levels: 15, tagline: "The full track — Legendary case, max boosters, elite statuses." }
};

function BattlePass() {
  const navigate = useNavigate();
  function roadHome() { navigate("/"); }

  var { data, refresh } = useBattlePass();
  var [notification, setNotification] = useState(null);
  var [claimingLevel, setClaimingLevel] = useState(null);

  useEffect(function () {
    function handleKeyDown(event) {
      if (event.key.toLowerCase() === "b") { devAddXp(250).then(refresh); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return function () { window.removeEventListener("keydown", handleKeyDown); };
  }, [refresh]);

  if (!data) {
    return <main className="battle-pass-page"></main>;
  }

  async function handleClaim(level, unlocked, claimed) {
    if (!unlocked || claimed || claimingLevel) return;
    setClaimingLevel(level);
    try {
      var result = await claimLevel(level);
      var lines = result.components.map(describeComponent);
      setNotification({ title: "REWARD CLAIMED", reward: lines.join(" · ") });
      setTimeout(function () { setNotification(null); }, 2600);
      await refresh();
    } catch (err) {
      setNotification({ title: "ERROR", reward: err.message });
      setTimeout(function () { setNotification(null); }, 2200);
    } finally {
      setClaimingLevel(null);
    }
  }

  if (!data.hasActiveTrack) {
    return (
      <main className="battle-pass-page">
        <section className="battle-pass-shell">
          <div className="section-heading"><div><h3>CHOOSE YOUR PASS</h3></div></div>

          <div className="bp-landing-grid">
            {["pro", "prime", "star"].map(function (id) {
              var info = TRACK_INFO[id];
              return (
                <div className={"bp-landing-card bp-landing-" + id} key={id}>
                  <span className="bp-landing-name">{info.name}</span>
                  <span className="bp-landing-levels">{info.levels + " LEVELS"}</span>
                  <p className="bp-landing-tagline">{info.tagline}</p>
                  <button className="bp-landing-cta" onClick={() => navigate("/prime")}>Unlock in Prime</button>
                </div>
              );
            })}
          </div>

          <p className="bp-landing-hint">Subscribe to Pro, Prime, or Star to start earning levels.</p>
        </section>
      </main>
    );
  }

  var xpPerLevel = data.xpPerLevel;
  var currentLevel = Math.floor(data.xp / xpPerLevel) + 1;
  var currentLevelXp = data.xp % xpPerLevel;
  var progress = (currentLevelXp / xpPerLevel) * 100;
  var unlockedCount = data.levels.filter(function (l) { return l.unlocked; }).length;

  return (
    <main className="battle-pass-page">
      <div className="Road-Home" onClick={roadHome}></div>

      <section className="battle-pass-shell">
        <section className="battle-pass-road-section">
          <div className="section-heading">
            <div><h3><span>{TRACK_INFO[data.track].name.toUpperCase()} — ROAD OF REWARDS</span></h3></div>
            <span className="road-count">{unlockedCount} / {data.levels.length}</span>
          </div>

          <div className="battle-pass-road">
            <div className="reward-list">
              {data.levels.map(function (lvl) {
                var isUnlocked = lvl.unlocked;
                var isClaimed = lvl.claimed;
                var lines = lvl.components.map(describeComponent);
                var isBundle = lvl.components.length > 1;

                return (
                  <div className={"reward-node " + (isUnlocked ? "is-unlocked" : "is-locked")} key={lvl.level}>
                    <div className="reward-node-top">
                      <span>LVL {String(lvl.level).padStart(2, "0")}</span>
                      <span>{isClaimed ? "CLAIMED" : "REWARD"}</span>
                    </div>

                    <div
                      className={"reward-card " + (isClaimed ? "is-claimed" : "") + (isBundle ? " is-bundle" : "")}
                      onClick={() => handleClaim(lvl.level, isUnlocked, isClaimed)}
                    >
                      <span className="reward-type">{isBundle ? "BUNDLE" : lvl.components[0].kind.toUpperCase()}</span>
                      <h4>{isBundle ? "FINAL BUNDLE" : describeComponent(lvl.components[0]).split(" ").slice(1).join(" ")}</h4>
                      {lines.map(function (line, i) { return <p key={i}>{line}</p>; })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="battle-pass-status">
          <div className="status-main">
            <div className="status-top">
              <div>
                <span className="status-label">CURRENT LEVEL</span>
                <strong className="status-level">{String(currentLevel).padStart(2, "0")}</strong>
              </div>
              <div className="status-xp">{currentLevelXp} XP<small> / {xpPerLevel} XP</small></div>
            </div>
            <div className="xp-progress-wrapper">
              <div className="xp-progress-line"><div className="xp-progress-fill" style={{ width: progress + "%" }} /></div>
              <div className="xp-progress-info">
                <span>LEVEL {String(currentLevel).padStart(2, "0")}</span>
                <span>{xpPerLevel - currentLevelXp} XP TO NEXT</span>
              </div>
            </div>
          </div>
          <div className="status-side">
            <span className="status-label">TOTAL XP</span>
            <strong>{data.xp.toLocaleString()}</strong>
            <span className="status-side-caption">SEASON PROGRESS</span>
          </div>
        </section>

        <section className="battle-pass-stats">
          <div className="section-heading">
            <div><span className="section-kicker">01 / SEASON</span><h3>PASS STATISTICS</h3></div>
          </div>
          <div className="stats-grid">
            <div className="stat-card"><span>LEVEL</span><strong>{String(currentLevel).padStart(2, "0")}</strong><small>CURRENT POSITION</small></div>
            <div className="stat-card"><span>XP</span><strong>{data.xp.toLocaleString()}</strong><small>TOTAL EARNED</small></div>
            <div className="stat-card"><span>REWARDS</span><strong>{String(unlockedCount).padStart(2, "0")}</strong><small>UNLOCKED</small></div>
            <div className="stat-card"><span>CASES</span><strong>{data.epicCases + data.mythicCases + data.legendaryCases}</strong><small>IN INVENTORY</small></div>
          </div>
          {data.statuses.length > 0 && (
            <div className="bp-status-badges">
              {data.statuses.map(function (s) { return <span className={"bp-status-badge bp-status-" + s} key={s}>{s.toUpperCase()}</span>; })}
            </div>
          )}
        </section>

        <footer className="battle-pass-footer">
          <div className="details-group">
            <h3 className="group-title">DOCUMENTATION</h3>
            <div className="doc-links">
              <div className="doc-item">
                <span className="d-id">{"TRACK: " + data.track.toUpperCase()}</span>
                <span className="d-tag">OFFICIAL</span>
              </div>
              <p className="doc-text">
                Earn XP by trading, sending USDT, and buying or selling crypto. Cases you earn along the
                way can be opened from the Prime page's XDrop section.
              </p>
            </div>
          </div>
        </footer>
      </section>

      {notification && (
        <div className="battle-pass-toast">
          <div><strong>{notification.title}</strong><span>{notification.reward}</span></div>
        </div>
      )}
    </main>
  );
}

export default BattlePass;