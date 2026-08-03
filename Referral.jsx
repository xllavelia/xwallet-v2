import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReferral, devAddRefXP } from "./useReferral";

var LEVEL_LADDER = [
  { level: 1, name: "Scout", rate: 1 },
  { level: 2, name: "Networker", rate: 3 },
  { level: 3, name: "Connector", rate: 5 },
  { level: 4, name: "Ambassador", rate: 7 },
  { level: 5, name: "Elite Partner", rate: 10 }
];

const Referral = () => {
  const navigate = useNavigate();
  function roadHome() { navigate(-1); }

  var { referral, refresh } = useReferral();
  var [copied, setCopied] = useState(false);

  if (!referral) {
    return <div className="ReferralContent"></div>;
  }

  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referral.referralCode).catch(function () {});
    }
    setCopied(true);
    setTimeout(function () { setCopied(false); }, 1500);
  }

  async function handleDevXP(amount) {
    await devAddRefXP(amount);
    refresh();
  }

  var progressPct = referral.isMaxLevel ? 100 : (referral.refXpIntoLevel / referral.refXpForLevel) * 100;

  return (
    <div className="ReferralContent">
      <div className="Road-Home" onClick={roadHome}></div>

      <div className="ref-page-wrapper">


        {/* PARTNER CARD */}
        <div className="partner-card">
          <div className="pc-main">
            <div className="pc-top">
              <div className="pc-label-group">
                <span className="pc-label">MEMBERSHIP TIER</span>
                <span className="pc-tier">{referral.levelName.toUpperCase()}</span>
              </div>
              <div className="pc-rate-box">
                <span className="pc-rate-val">{referral.commissionPercent + "%"}</span>
                <span className="pc-rate-label">COMMISSION</span>
              </div>
            </div>

            <div className="pc-center">
              <span className="pc-label">YOUR REFERRAL CODE</span>
              <div className="pc-code-display">
                <span className="pc-code">{referral.referralCode}</span>
                <button className="pc-copy-btn" onClick={handleCopy}>{copied ? "COPIED" : "COPY"}</button>
              </div>
            </div>
          </div>

          <div className="pc-side">
            <div className="pc-barcode-mini"></div>
          </div>
        </div>

        {/* LEVEL PROGRESS */}
        <div className="rlp-progress-card">
          <div className="rlp-progress-top">
            <div className="rlp-progress-level">
              <span className="rlp-progress-num">{"LVL " + referral.level}</span>
              <span className="rlp-progress-name">{referral.levelName}</span>
            </div>
            {!referral.isMaxLevel && (
              <span className="rlp-progress-xp">{referral.refXpIntoLevel + " / " + referral.refXpForLevel + " XP"}</span>
            )}
            {referral.isMaxLevel && <span className="rlp-progress-max">MAX LEVEL</span>}
          </div>

          <div className="rlp-progress-bar">
            <div className="rlp-progress-bar-fill" style={{ width: progressPct + "%" }}></div>
          </div>

          {!referral.isMaxLevel && (
            <div className="rlp-progress-next">
              {"Next: " + referral.nextLevelName + " (" + referral.nextLevelRate + "% commission)"}
            </div>
          )}
        </div>

        {/* <div className="rlp-ladder">
          {LEVEL_LADDER.map(function (lv) {
            var isCurrent = lv.level === referral.level;
            var isPast = lv.level < referral.level;
            var rowClass = "rlp-ladder-row" + (isCurrent ? " current" : "") + (isPast ? " past" : "");
            return (
              <div className={rowClass} key={lv.level}>
                <span className="rlp-ladder-badge">{lv.level}</span>
                <span className="rlp-ladder-name">{lv.name}</span>
                <span className="rlp-ladder-rate">{lv.rate + "%"}</span>
              </div>
            );
          })}
        </div> */}

        {/* STATISTICS SECTION */}
        <div className="ref-details">

          <div className="details-group">
            <h3 className="group-title">NETWORK GROWTH</h3>
            <div className="stats-list">
              <div className="stats-item">
                <span className="s-label">Friends invited</span>
                <span className="s-dots"></span>
                <span className="s-value">{referral.friendsInvited + " users"}</span>
              </div>
              <div className="stats-item">
                <span className="s-label">Active traders</span>
                <span className="s-dots"></span>
                <span className="s-value">{referral.activeTraders + " active"}</span>
              </div>
              <div className="stats-item">
                <span className="s-label">Conversion rate</span>
                <span className="s-dots"></span>
                <span className="s-value">{referral.conversionRate.toFixed(0) + "%"}</span>
              </div>
            </div>
          </div>

          <div className="details-group">
            <h3 className="group-title">TRADING VOLUME</h3>
            <div className="stats-list">
              <div className="stats-item">
                <span className="s-label">Total friends turnover</span>
                <span className="s-dots"></span>
                <span className="s-value">{"$ " + referral.totalReferredVolume.toLocaleString()}</span>
              </div>
              <div className="stats-item">
                <span className="s-label">{"Your share (" + referral.commissionPercent + "%)"}</span>
                <span className="s-dots"></span>
                <span className="s-value">{"$ " + referral.totalEarned.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="details-group">
            <h3 className="group-title">HOW TO EARN XP</h3>
            <div className="rlp-xp-sources">
              <div className="rlp-xp-source">
                <span className="rlp-xp-badge">+25</span>
                <span className="rlp-xp-source-text">Per friend who joins with your code</span>
              </div>
              <div className="rlp-xp-source">
                <span className="rlp-xp-badge">+50</span>
                <span className="rlp-xp-source-text">Battle Pass reward — claim as a voucher</span>
              </div>
            </div>
            <p className="rlp-xp-hint">Have a code from a friend? You'll be able to redeem it in Promo Codes soon.</p>
          </div>

          <div className="details-group">
            <h3 className="group-title">PARTNER POLICY</h3>
            <div className="policy-box">
              <p className="policy-text">
                Partners earn between 1% and 10% of every trading fee paid by their referrals,
                depending on their level. Rewards are credited instantly to the main balance.
                Multiple accounts are strictly prohibited.
              </p>
              <div className="legal-links">
                <a>Rules</a>
                <span className="sep">/</span>
                <a>Support</a>
                <span className="sep">/</span>
                <a>Privacy</a>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* <div className="rlp-dev-tools">
        <span className="rlp-dev-label">DEV</span>
        <button onClick={() => handleDevXP(25)}>+25 XP</button>
        <button onClick={() => handleDevXP(100)}>+100 XP</button>
      </div> */}
    </div>
  );
};

export default Referral;