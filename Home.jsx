import React, {useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "./useAccount";
import { useWalletBalance } from "./useWallet";
import { useSavings } from "./useSavings";
import { useCard } from "./useCard";
import { useTransfersRemote } from "./useTransfers";
import { Glyph } from "./HistoryShared";
import history1 from './history1.jpg';
import history2 from './history2.jpg';
import history3 from './history3.jpg';
import history4 from './history4.jpg';


//npx vite --host 0.0.0.0 --port 5173 --force
// git add .
// git commit -m "fix hrd"
// git push -u origin main 

// git commit -m "fix"

// git add .
// git commit --amend --no-edit
// git push --force-with-lease

// git push 
// rm -rf .git
// git init
// git checkout -b main
// git add .
// git commit -m "initial clean state"
// git branch -M main
// git remote add origin  https://github.com/xllavelia/xwallet-GO.git
// git push -f origin main


function SearchIcon() {
  return (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
}
function WalletIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><path d="M16 12h.01"></path><path d="M3 10h18"></path></svg>);
}
function SavingsIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"></path><path d="M15 7h6v6"></path></svg>);
}
function CardIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="2.5"></rect><line x1="2.5" y1="10" x2="21.5" y2="10"></line></svg>);
}
function GiftIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l9-4 9 4-9 4-9-4Z"></path><path d="M3 8v9l9 4 9-4V8"></path><line x1="12" y1="12" x2="12" y2="21"></line></svg>);
}

var PROMO_TILES = [
  { id: "battlepass", title: "Battle Pass", sub: "Season rewards", path: "/battlepass", cls: "tile-a" },
  { id: "prime", title: "Prime", sub: "Membership", path: "/prime", cls: "tile-b" },
  { id: "referral", title: "Referrals", sub: "Earn commission", path: "/referral", cls: "tile-c" },
  { id: "promo", title: "Promo Code", sub: "Redeem a code", path: "/promocode", cls: "tile-d" }
];

const Home = () => {
  const navigate = useNavigate();


  var { account } = useAccount();
  var { wallet } = useWalletBalance();
  var { savings } = useSavings();
  var { card } = useCard();
  var { transfers } = useTransfersRemote();

  var avatarInitial = account && account.username ? account.username[0].toUpperCase() : "?";
  var username = account ? account.username : "";
  var primeTier = wallet.primeTier;

  var savingsBalance = savings ? savings.balance : 0;
  var cardBalance = card ? card.balanceUsd : 0;

  var recentTransfers = transfers.slice(0, 3);


  const STORIES = [
  {
    id: 1,
    title: '',
    layout: 'top-left',
        text: '',
        image:  history1,

    slides: [
      {
        image:  history1,
        title: '',
        text: '',
      },
    ],
  },
  {
    id: 2,
    title: '',
    layout: 'bottom-right',
        text: '',
        image:  history2,
    slides: [
      {
        image: history2,
        title: '',
        text: '',
      },
      {
        image: history2,
        title: '',
        text: '',
      },
    ],
  },
  {
    id: 3,
    title: '',
    layout: 'center-right',
        text: '',
        image:  history3,

    slides: [
      {
        image: history3,
        title: '',
        text: '',
      },
    ],
  },
  {
    id: 4,
    title: '',
    layout: 'top-left',
        text: '',
        image:  history4,

    slides: [
      {
        image: history4,
        title: '',
        text: '',
      },
    ],
  },
];
 
const SLIDE_DURATION = 5000; // мс, автоплей одного слайда
  const [openIndex, setOpenIndex] = useState(null); // индекс открытой истории
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);
 
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const pausedRef = useRef(false);
 
  const isOpen = openIndex !== null;
  const activeStory = isOpen ? STORIES[openIndex] : null;
  const totalSlides = activeStory ? activeStory.slides.length : 0;
 
  useEffect(() => {
    if (!isOpen) return;
 
    function tick(now) {
      if (pausedRef.current) {
        startRef.current = now - progress * SLIDE_DURATION;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const pct = Math.min(elapsed / SLIDE_DURATION, 1);
      setProgress(pct);
 
      if (pct >= 1) {
        goNextSlide();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
 
    startRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
 
    return function cleanup() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, openIndex, slideIndex]);
 
  function openStory(index) {
    setOpenIndex(index);
    setSlideIndex(0);
    setProgress(0);
    setOpening(true);
    window.setTimeout(function () {
      setOpening(false);
    }, 260);
  }
 
  function closeStory() {
    setClosing(true);
    window.setTimeout(function () {
      setClosing(false);
      setOpenIndex(null);
      setSlideIndex(0);
      setProgress(0);
    }, 220);
  }
 
  function goNextSlide() {
    const isLastSlide = slideIndex >= totalSlides - 1;
    const isLastStory = openIndex >= STORIES.length - 1;
 
    if (!isLastSlide) {
      setSlideIndex(slideIndex + 1);
      setProgress(0);
      return;
    }
    if (!isLastStory) {
      setOpenIndex(openIndex + 1);
      setSlideIndex(0);
      setProgress(0);
      return;
    }
    closeStory();
  }
 
  function goPrevSlide() {
    const isFirstSlide = slideIndex === 0;
    const isFirstStory = openIndex === 0;
 
    if (!isFirstSlide) {
      setSlideIndex(slideIndex - 1);
      setProgress(0);
      return;
    }
    if (!isFirstStory) {
      const prevStory = STORIES[openIndex - 1];
      setOpenIndex(openIndex - 1);
      setSlideIndex(prevStory.slides.length - 1);
      setProgress(0);
      return;
    }
    setProgress(0);
  }
 
  function handleStageClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isRightSide = clickX > rect.width / 2;
    if (isRightSide) {
      goNextSlide();
    } else {
      goPrevSlide();
    }
  }
 
  function handlePressStart() {
    pausedRef.current = true;
  }
 
  function handlePressEnd() {
    pausedRef.current = false;
  }

  const currentSlide = activeStory ? activeStory.slides[slideIndex] : null;
 


    var [btcPrice, setBtcPrice] = useState(null);

  useEffect(function () {
    var active = true;
    fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!active) return;
        setBtcPrice(parseFloat(d.price));
      })
      .catch(function () {});
    return function () { active = false; };
  }, []);

  var priceLabel = btcPrice ? "$" + btcPrice.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "Live rates";

  return (
    <div className="HomeRedesignContent">
      <div className="hrd-page">

        <div className="hrd-top-row">
          <div className="hrd-profile-chip" onClick={() => navigate("/profile")}>
            <div className="hrd-avatar">{avatarInitial}</div>
            <div className="hrd-profile-text">
              <span className="hrd-username">{username}</span>
              {primeTier && <span className="hrd-prime-badge">{primeTier.toUpperCase()}</span>}
            </div>
          </div>
          <button className="hrd-invite-btn" onClick={() => navigate("/referral")}>
            <GiftIcon /> Frend
          </button>
        </div>

        <div className="hrd-search-bar" onClick={() => navigate("/services")}>
          <SearchIcon />
          <span>Search modules and features</span>
        </div>

      

 <div className="stories-root">
      <div className="stories-scroll">
        {STORIES.map(function (story, index) {
          return (
          <div className="story-card"  key={story.id}
             
              onClick={function () {
                openStory(index);
              }} >
            <article className="newsCard newsCardMain">
              <img className="story-image" src={story.image} alt="" />
            </article>

          </div>
      
          );
        })}
      </div>
 
      {isOpen && (
        <div
          className={
            'story-viewer' +
            (opening ? ' story-viewer--opening' : '') +
            (closing ? ' story-viewer--closing' : '')
          }
        >
          <div className="story-stage">
            <div className="story-progress-row">
              {activeStory.slides.map(function (_, i) {
                const filled = i < slideIndex ? 1 : i === slideIndex ? progress : 0;
                return (
                  <div className="story-progress-track" key={i}>
                    <div
                      className="story-progress-fill"
                      style={{ transform: 'scaleX(' + filled + ')' }}
                    />
                  </div>
                );
              })}
            </div>
 
            <button className="story-close" onClick={closeStory} aria-label="Закрыть">
              ✕
            </button>
 
            <div
              className="story-tap-zone"
              onClick={handleStageClick}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
            >
              <img className="story-image" src={currentSlide.image} alt="" />
 
              <div className={'story-text story-text--' + activeStory.layout}>
                <h3 className="story-text-title">{currentSlide.title}</h3>
                <p className="story-text-body">{currentSlide.text}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>



        <div className="hrd-summary-row">
          <div className="hrd-summary-card" onClick={() => navigate("/history")}>
            <span className="hrd-summary-label">All Operations <br /> main wallet</span>
            <span className="hrd-summary-value">{"$" + wallet.balance.toFixed(2)}</span>
            <div className="hrd-summary-bar">
              <span style={{ width: "60%", background: "hsl(61,85%,78%)" }}></span>
              <span style={{ width: "25%", background: "hsl(280,70%,65%)" }}></span>
              <span style={{ width: "15%", background: "rgba(255,255,255,0.15)" }}></span>
            </div>
          </div>
          <div className="hrd-summary-card" onClick={() => navigate("/bonus")}>
            <span className="hrd-summary-label">Vouchers </span>
            <span className="hrd-summary-value">Rewards and vouchers</span>
            <span className="hrd-summary-cta">View all</span>
          </div>
        </div>
   

       <div className="hrd-accounts-list">

  {/* Main Wallet */}
  <div className="hrd-account-row" onClick={() => navigate("/history")}>
    <div className="hrd-account-icon wallet">
      <WalletIcon />
    </div>

    <div className="hrd-account-info">
      <span className="hrd-account-balance">
        {"$" + wallet.balance.toFixed(2)}
      </span>

      <span className="hrd-account-name">
        Main Wallet
      </span>

      <div className="hrd-account-actions">
        <button
          className="hrd-native-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/promocode");
          }}
        >
          Promocodes
        </button>

        <button
          className="hrd-native-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/ads");
          }}
        >
          ads
        </button>
      </div>
    </div>

    <div className="hrd-account-chevron">›</div>
  </div>


  {/* Savings */}
  <div className="hrd-account-row" onClick={() => navigate("/savings")}>
    <div className="hrd-account-icon savings">
      <SavingsIcon />
    </div>

    <div className="hrd-account-info">
      <span className="hrd-account-balance">
        {"$" + savingsBalance.toFixed(2)}
      </span>

      <span className="hrd-account-name">
        Savings Account · 12% APY
      </span>

      <div className="hrd-account-actions">
        <button
          className="hrd-native-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/prime");
          }}
        >
          Prime subscription
        </button>
      </div>
    </div>

    <div className="hrd-account-chevron">›</div>
  </div>


  {/* Crypto Card */}
  <div className="hrd-account-row" onClick={() => navigate("/card")}>
    <div className="hrd-account-icon card">
      <CardIcon />
    </div>

    <div className="hrd-account-info">
      <span className="hrd-account-balance">
        {"$" + cardBalance.toFixed(2)}
      </span>

      <span className="hrd-account-name">
        Crypto Card
      </span>

      <div className="hrd-account-actions">
        <button
          className="hrd-native-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/battlepass");
          }}
        >
          Battle pass
        </button>
      </div>
    </div>

    <div className="hrd-account-chevron">›</div>
  </div>

</div>

        <div className="hrd-recent-section">
          <div className="hrd-recent-header">
            <span className="hrd-recent-title">Recent Activity</span>
          </div>

          {recentTransfers.length === 0 && (
            <div className="hlist-empty">No activity yet — try sending USDT to a friend.</div>
          )}

          {recentTransfers.map(function (item) {
            var isSend = item.direction === "send";
            var amt = parseFloat(item.amount) || 0;
            return (
              <div className="hlist-row" key={item.id} onClick={() => navigate("/sendcheck", { state: { transferId: item.id } })}>
                <div className={"hlist-icon " + (isSend ? "neg" : "pos")}><Glyph type={isSend ? "down" : "up"} /></div>
                <div className="hlist-info">
                  <span className="hlist-name">{(isSend ? "To " : "From ") + item.counterparty}</span>
                  <span className="hlist-sub">Transfer</span>
                </div>
                <div className="hlist-right">
                  <span className={"hlist-amount " + (isSend ? "neg" : "pos")}>{(isSend ? "-$" : "+$") + amt.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
     <div className="hrd-summary-row">

              <div className="hqa-card hqa-send" onClick={() => navigate("/send")}>
        <span className="hqa-label">Move funds</span>
        <span className="hqa-title">Send</span>
        <span className="hqa-sub">Ready in seconds</span>
      </div>

      <div className="hqa-card hqa-trade" onClick={() => navigate("/trade")}>
        <span className="hqa-label">BTC · USD</span>
        <span className="hqa-title">Trade</span>
        <span className="hqa-sub">{priceLabel}</span>
    </div>
      </div>
      </div>
    </div>
  );
};

export default Home;