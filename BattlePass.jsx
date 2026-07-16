import { div } from "framer-motion/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const REWARDS = [
  {
    id: 1,
    level: "01",
    title: "FIRST DROP",
    reward: "+5 USDT",
  },
  {
    id: 2,
    level: "02",
    title: "REFERRAL BOOST",
    reward: "+10% REFERRAL",
  },
  {
    id: 3,
    level: "03",
    title: "COUPON UPGRADE",
    reward: "×2 COUPON POWER",
  },
  {
    id: 4,
    level: "04",
    title: "LOWER FEES",
    reward: "-15% COMMISSION",
  },
  {
    id: 5,
    level: "05",
    title: "NETWORK",
    reward: "+5 CONTACTS",
  },
  {
    id: 6,
    level: "06",
    title: "USDT DROP",
    reward: "+25 USDT",
  },
  {
    id: 7,
    level: "07",
    title: "REFERRAL RANK",
    reward: "RANK UPGRADE",
  },
  {
    id: 8,
    level: "08",
    title: "FINAL ACCESS",
    reward: "PREMIUM PERKS",
  },
];

function BattlePass() {
const navigate = useNavigate();

  function roadHome() { navigate("/"); }

  const [xp, setXp] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [notification, setNotification] = useState(null);

  const xpPerLevel = 1000;

  const currentLevel = Math.floor(xp / xpPerLevel) + 1;
  const currentLevelXp = xp % xpPerLevel;
  const progress = (currentLevelXp / xpPerLevel) * 100;

  const unlockedRewards = Math.min(
    Math.floor(xp / xpPerLevel),
    REWARDS.length
  );

  const addTestXp = () => {
    setXp((prevXp) => prevXp + 250);
  };

  const claimReward = (reward) => {
    const rewardIndex = REWARDS.findIndex(
      (item) => item.id === reward.id
    );

    const isUnlocked = rewardIndex < unlockedRewards;
    const isClaimed = claimedRewards.includes(reward.id);

    if (!isUnlocked || isClaimed) {
      return;
    }

    setClaimedRewards((prevRewards) => [
      ...prevRewards,
      reward.id,
    ]);

    setNotification({
      title: "REWARD CLAIMED",
      reward: reward.reward,
    });

    setTimeout(() => {
      setNotification(null);
    }, 2200);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === "b") {
        addTestXp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const [isOpen, setIsOpen] = useState(false);

  return (
    
    <main className="battle-pass-page">

      <section className="battle-pass-shell">
        {/* <section className="battle-pass-hero">
          <div className="hero-content">
            <h2>
              THE
              <br />
              <span>ROAD</span>
            </h2>
          </div>
        </section> */}

        
        <section className="battle-pass-road-section">
          <div className="section-heading">
            <div>
             

              <h3> <span onClick={addTestXp}>ROAD OF REWARDS </span><span className="status-pass" onClick={() => setIsOpen(true)}>PRIME</span></h3>
            </div>

            <span className="road-count">
              {unlockedRewards} / {REWARDS.length}
            </span>
          </div>

          <div className="battle-pass-road">
         

            <div className="reward-list">
              {REWARDS.map((reward, index) => {
                const isUnlocked = index < unlockedRewards;
                const isClaimed = claimedRewards.includes(
                  reward.id
                );

                return (
                  <div
                    className={`reward-node ${
                      isUnlocked
                        ? "is-unlocked"
                        : "is-locked"
                    }`}
                    key={reward.id}
                  >
                    <div className="reward-node-top">
                      <span>
                        LVL {reward.level}
                      </span>

                      <span>
                        {isClaimed ? "CLAIMED" : "REWARD"}
                      </span>
                    </div>

                    {/* <button
                      className={`reward-square ${
                        isClaimed ? "is-claimed" : ""
                      }`}
                      onClick={() => claimReward(reward)}
                      disabled={!isUnlocked || isClaimed}
                      type="button"
                    >
                      <span />
                    </button> */}

                    <div className={`reward-card ${
                        isClaimed ? "is-claimed" : ""
                      }`}   onClick={() => claimReward(reward)}
                      disabled={!isUnlocked || isClaimed}>
                      <span className="reward-type">
                        {reward.level}
                      </span>

                      <h4>{reward.title}</h4>

                      <p>{reward.reward}</p>
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
                <span className="status-label">
                  CURRENT LEVEL
                </span>

                <strong className="status-level">
                  {String(currentLevel).padStart(2, "0")}
                </strong>
              </div>

              <div className="status-xp">
                {currentLevelXp} XP
                <small> / {xpPerLevel} XP</small>
              </div>
            </div>

            <div className="xp-progress-wrapper">
              <div className="xp-progress-line">
                <div
                  className="xp-progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <div className="xp-progress-info">
                <span>
                  LEVEL {String(currentLevel).padStart(2, "0")}
                </span>

                <span>
                  {xpPerLevel - currentLevelXp} XP TO NEXT
                </span>
              </div>
            </div>
          </div>

          <div className="status-side">
            <span className="status-label">
              TOTAL XP
            </span>

            <strong>
              {xp.toLocaleString()}
            </strong>

            <span className="status-side-caption">
              SEASON PROGRESS
            </span>
          </div>
        </section>

        <section className="battle-pass-stats">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                01 / SEASON
              </span>

              <h3>PASS STATISTICS</h3>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>LEVEL</span>

              <strong>
                {String(currentLevel).padStart(2, "0")}
              </strong>

              <small>CURRENT POSITION</small>
            </div>

            <div className="stat-card">
              <span>XP</span>

              <strong>
                {xp.toLocaleString()}
              </strong>

              <small>TOTAL EARNED</small>
            </div>

            <div className="stat-card">
              <span>REWARDS</span>

              <strong>
                {String(unlockedRewards).padStart(2, "0")}
              </strong>

              <small>UNLOCKED</small>
            </div>

            <div className="stat-card">
              <span>SEASON</span>

              <strong>01</strong>

              <small>ACTIVE SEASON</small>
            </div>
          </div>
        </section>

        <footer className="battle-pass-footer">
        

        <div className="details-group">
            <h3 className="group-title">DOCUMENTATION</h3>
            <div className="doc-links">
              <div className="doc-item">
                <span className="d-id"></span>
                <span className="d-tag">OFFICIAL</span>
              </div>
              <p className="doc-text">
                This voucher reduces trading commission by 100%. Applied automatically
                to all pairs. Refund is processed in USDT to your main balance.
              </p>
              <div className="legal-row">
                <a href="#terms" >Terms of Use</a>
                <span className="sep">·</span>
                <a href="#privacy">Privacy Policy</a>
              </div>
            </div>
          </div>
        </footer>

      </section>

      {notification && (
        <div className="battle-pass-toast">
         

          <div>
            <strong>
              {notification.title}
            </strong>

            <span>
              {notification.reward}
            </span>
          </div>
        </div>
      )}

 <div className={'bo-overlay' + (isOpen ? ' open' : '')}>
        
        {/* Клик по фону закрывает окно */}
        <div className="bo-backdrop" onClick={() => setIsOpen(false)}></div>

        {/* ОСТРОВ-ТИКЕТ ПО ЦЕНТРУ */}
        <div className={'bo-ticket' + (isOpen ? ' open' : '')}>
          
          <div className="bo-ticket-inner">
            {/* ШАПКА ТИКЕТА */}
            <div className="bo-header">
              <div className="bo-col">
                <span className="bo-status"></span>
              </div>
              {/* <button className="bo-close-btn" onClick={() => setIsOpen(false)}>
                ✕
              </button> */}
            </div>

            {/* ГЛАВНЫЙ БАЛАНС */}
            <div className="bo-main-balance">
              <span className="bo-bal-label">subcribe </span>
              <span className="bo-bal-val">
PRIME
              </span>
            </div>

            <div className="bo-divider"></div>

            {/* БЛОК ПРОФИТА (24ч и 7д) */}
            <div className="bo-row">
              <div className="bo-col">
                <span className="bo-label"> owner </span>
                <span className="bo-val-bold"> xlavelia </span>
              </div>
              <div className="bo-col right">
                <span className="bo-label">status</span>
                <span className="bo-val-bold">active</span>
              </div>
            </div>

            <div className="bo-divider"></div>

            {/* РАСШИРЕННАЯ СТАТИСТИКА */}
            <div className="bo-stats-list">
              
              <div className="bo-stat-item">
<ul>
<li> Exclusive Rewards</li>
<li> Zero-Fee Transfers</li>
<li> Fee Vouchers</li>
<li> Referral Boosts</li>
<li> Cashback Rewards</li>
<li>  Premium Features</li>
<li> Early Access </li>
<li> Priority Support </li>
<li> Custom Wallet ID </li>
<li> Advanced History </li>
<li> Extra Wallet Slots</li>
<li> Transfer Templates</li>
<li> Limited Drops</li>
<li> Exclusive Perks</li>
<li> Seasonal Rewards</li>
</ul>
              </div>
           
            </div>
<button className="bo-settings-btn">
              {/* <span className="set-icon">⚙</span> */}
              <span className="set-text"><a href="http://t.me/xwlltbot">@xwlltbot</a></span>
            </button>

          </div>
          
          {/* Боковой корешок для стиля тикета */}
          <div className="bo-ticket-stub">
<span className="stub-text"></span>
            <div className="stub-barcode"></div>
          </div>

        </div>
      </div>
    
    </main>
  );
}

export default BattlePass;