import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "./useAccount";
import { useWalletBalance } from "./useWallet";
import { useClosedPositionsRemote } from "./usePositions";
import { useBankCards } from "./useBankCards";
import { useHomeSummary } from "./useHomeSummary";
import { useSavings } from "./useSavings";
// import history1 from './history1.jpg';
// import history2 from './history2.jpg';
// import history3 from './history3.jpg';
// import history4 from './history4.jpg';
import { MiniCardThumb } from "./bankCardVisuals";
import { useStockPortfolio } from "./useStocks";
import { useCard } from "./useCard";
import PortfolioComm from "./PortfolioComm";


//npx vite --host 0.0.0.0 --port 5173 --force
// git add .
// git commit -m "bug fix"
// git push -u origin main 


// git commit -m "fix"

// git add .
// git commit --amend --no-edit
// git push --force-with-lease

// git reset --soft HEAD~1
// git add .
// git commit --amend --no-edit

// git push 
// rm -rf .git
// git init
// git checkout -b main
// git add .
// git commit -m "initial clean state"
// git branch -M main
// git remote add origin  https://github.com/xllavelia/xwallet-GO.git
// git push -f origin main


// ── Настраиваемый параметр: сколько px "форс-блока" остаётся видно снизу
// когда он полностью утянут вниз (это и есть та самая ручка для возврата).
var PEEK_HEIGHT_PX = 32;

function SearchIcon() {
  return (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
}
function GiftIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l9-4 9 4-9 4-9-4Z"></path><path d="M3 8v9l9 4 9-4V8"></path><line x1="12" y1="12" x2="12" y2="21"></line></svg>);
}
function TradeIcon() {
return (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="#fff" d="M7 20v-2H5V6h2V4h2v2h2v12H9v2zm0-4h2V8H7zm8 4v-5h-2V8h2V4h2v4h2v7h-2v5zm0-7h2v-3h-2zm1-1.5" /></svg> )
}
function SendIcon() {
return (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14L21 3m0 0l-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1z" /></svg>)  
}
function CrownIcon() {
return (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h16V8H4zm3.5-1l-1.4-1.4L8.675 13l-2.6-2.6L7.5 9l4 4zm4.5 0v-2h6v2z" /></svg>) 
}
function RocketIcon() {
  return (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-8 5-10Z"></path><circle cx="12" cy="10" r="1.6"></circle><path d="M9 16l-3 3M15 16l3 3"></path></svg>);
}
function P2PIcon() {
  return (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>);
}
function GridIcon() {
  return (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.8"></rect><rect x="14" y="3" width="7" height="7" rx="1.8"></rect><rect x="3" y="14" width="7" height="7" rx="1.8"></rect><rect x="14" y="14" width="7" height="7" rx="1.8"></rect></svg>);
}
function ProfileTileIcon() {
  return (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"></path></svg>);
}


function getGreeting() {
  var h = new Date().getHours();
  if (h < 12) return "Welcome";
  if (h < 18) return "Hello";
  return "Evening";
}


function formatUsd(n) { return "$" + n.toFixed(2); }
function formatAmount(n, id) {
  var decimals = n < 0.01 ? 5 : (n < 1 ? 4 : 2);
  return n.toFixed(decimals) + " " + id;
}


const Home = () => {
  const navigate = useNavigate();

  var { account } = useAccount();
  var { wallet } = useWalletBalance();
  var { closedPositions } = useClosedPositionsRemote();
 var { data: cardsData } = useBankCards();
  var summary = useHomeSummary();

  var { portfolio } = useStockPortfolio();
  var { card } = useCard();


  var avatarInitial = account && account.username ? account.username[0].toUpperCase() : "?";
  var username = account ? account.username : "";
var { savings } = useSavings();

var estDaily = savings
  ? savings.balance * (savings.interestRate / 100) / 365
  : 0;

var estMonthly = savings
  ? savings.balance * (savings.interestRate / 100) / 12
  : 0;

var estYearly = savings
  ? savings.balance * (savings.interestRate / 100)
  : 0;

var totalDeposited = savings
  ? savings.history
      .filter(function (h) { return h.entryType === "deposit"; })
      .reduce(function (acc, h) { return acc + h.amount; }, 0)
  : 0;

var totalWithdrawn = savings
  ? savings.history
      .filter(function (h) { return h.entryType === "withdrawal"; })
      .reduce(function (acc, h) { return acc + h.amount; }, 0)
  : 0;
const [clickMode, setClickMode] = useState(false);
const [handlePulse, setHandlePulse] = useState(false);
  var [balanceHidden, setBalanceHidden] = useState(false);
  var [isOpen, setIsOpen] = useState(false);
  var [maxDragY, setMaxDragY] = useState(420);
  var lowerAreaRef = useRef(null);
  var forceBlockRef = useRef(null);
  var hiddenContentRef = useRef(null);
const stateRef = useRef({
  maxDragY: 420,
  currentY: 0,
  isDragging: false,
  startClientY: 0,
  startValue: 0,
  lastClientY: 0,
  lastTime: 0,
  velocity: 0,
  dragDistance: 0
});

function applyVisualPosition(y, withTransition) {
  const s = stateRef.current;
  const clamped = Math.max(0, Math.min(s.maxDragY, y));

  s.currentY = clamped;

  if (forceBlockRef.current) {
    forceBlockRef.current.style.transition = withTransition
      ? "transform 850ms cubic-bezier(0.22, 1.15, 0.36, 1)"
      : "none";

    forceBlockRef.current.style.transform =
      `translateY(${clamped}px)`;
  }

  if (hiddenContentRef.current) {
    const progress =
      s.maxDragY > 0
        ? clamped / s.maxDragY
        : 0;

    hiddenContentRef.current.style.transition = withTransition
      ? "opacity 700ms ease, transform 850ms cubic-bezier(0.22, 1.15, 0.36, 1)"
      : "none";

    hiddenContentRef.current.style.opacity =
      (0.3 + progress * 0.7).toString();

    hiddenContentRef.current.style.transform =
      `translateY(${(1 - progress) * 16}px)`;
  }
}

useLayoutEffect(() => {
  function measure() {
    if (!lowerAreaRef.current) return;

    const h = lowerAreaRef.current.clientHeight;

    stateRef.current.maxDragY =
      Math.max(120, h - PEEK_HEIGHT_PX);

    if (!stateRef.current.isDragging) {
      applyVisualPosition(
        isOpen
          ? stateRef.current.maxDragY
          : 0,
        false
      );
    }
  }

  measure();

  window.addEventListener("resize", measure);

  return () => {
    window.removeEventListener("resize", measure);
  };
}, []);

useEffect(() => {
  if (stateRef.current.isDragging) return;

  applyVisualPosition(
    isOpen
      ? stateRef.current.maxDragY
      : 0,
    true
  );
}, [isOpen]);

const handleWindowPointerMove = useCallback((e) => {
  const s = stateRef.current;

  if (!s.isDragging) return;

  const deltaY =
    e.clientY - s.startClientY;

  s.dragDistance = Math.abs(deltaY);

  applyVisualPosition(
    s.startValue + deltaY,
    false
  );

  const now = performance.now();
  const dt = now - s.lastTime;

  if (dt > 4) {
    s.velocity =
      (e.clientY - s.lastClientY) / dt;

    s.lastClientY = e.clientY;
    s.lastTime = now;
  }
}, []);

const handleWindowPointerUp = useCallback(() => {
  const s = stateRef.current;

  if (!s.isDragging) return;

  s.isDragging = false;

  window.removeEventListener(
    "pointermove",
    handleWindowPointerMove
  );

  window.removeEventListener(
    "pointerup",
    handleWindowPointerUp
  );

  window.removeEventListener(
    "pointercancel",
    handleWindowPointerUp
  );

  let shouldOpen;

  if (Math.abs(s.velocity) > 0.45) {
    shouldOpen = s.velocity > 0;
  } else {
    shouldOpen =
      s.currentY > s.maxDragY / 2;
  }

  s.velocity = 0;
  s.dragDistance = 0;

  setIsOpen(shouldOpen);

  requestAnimationFrame(() => {
    applyVisualPosition(
      shouldOpen
        ? s.maxDragY
        : 0,
      true
    );
  });
}, [handleWindowPointerMove]);


function handlePointerDown(e) {
  if (clickMode) return;

  const s = stateRef.current;

  s.isDragging = true;
  s.startClientY = e.clientY;
  s.startValue = s.currentY;
  s.lastClientY = e.clientY;
  s.lastTime = performance.now();
  s.velocity = 0;

  window.addEventListener(
    "pointermove",
    handleWindowPointerMove,
    { passive: true }
  );

  window.addEventListener(
    "pointerup",
    handleWindowPointerUp,
    { passive: true }
  );

  window.addEventListener(
    "pointercancel",
    handleWindowPointerUp,
    { passive: true }
  );
}
const handleIslandClick = useCallback(() => {
  if (!clickMode) return;

  const s = stateRef.current;
  const nextOpen = !isOpen;

  setIsOpen(nextOpen);

  applyVisualPosition(
    nextOpen ? s.maxDragY : 0,
    true
  );
}, [clickMode, isOpen]);

function toggleInteractionMode() {
  setClickMode(v => !v);

  setHandlePulse(true);

  setTimeout(() => {
    setHandlePulse(false);
  }, 200);
}

  var change24h = { amount: 0, percent: 0 };
  (function () {
    var since = Date.now() - 24 * 60 * 60 * 1000;
    var total = 0;
    closedPositions.forEach(function (p) {
      if (new Date(p.closedAt).getTime() >= since) {
        total += parseFloat(p.pnl) || 0;
      }
    });
    change24h.amount = total;
    var base = wallet.balance - total;
    change24h.percent = base > 0 ? (total / base) * 100 : 0;
  })();

  var avatarInitial = account && account.username ? account.username[0].toUpperCase() : "?";
  var username = account ? account.username : "";
  var balanceValue = Math.floor(wallet.balance || 0).toLocaleString("en-US");
// var balanceValue = Math.floor(wallet.balance || 0).toLocaleString("de-DE");
  var changeIsPositive = change24h.amount >= 0;


  
  

  return (
    <div className="hv2-page">

      <div className="hv2-hero">
        


        <div className="hv2-top-row">
          <div className="hv2-identity" onClick={() => navigate("/setting")}>
            <div className="hv2-avatar">{avatarInitial}</div>
            <div className="hv2-identity-text">
              <span className="hv2-greeting">{getGreeting()}</span>
              <span className="hv2-username">{username}</span>
            </div>
          </div>
          <div className="hv2-top-actions">
            <button className="hv2-icon-btn" onClick={() => navigate("/services")}><SearchIcon /></button>
            <button className="hv2-icon-btn" onClick={() => navigate("/referral")}><GiftIcon /></button>
          </div>
        </div>

        <div className="hv2-balance-block" >
          <span className="hv2-balance-label"  onDoubleClick={toggleInteractionMode}>Wallet Balance</span>
          <span className="hv2-balance-value"  onClick={() => navigate("/balancecard")}>{balanceHidden ? "******" : ("$" + balanceValue)}</span>
          <div className="hv2-balance-change-row" onDoubleClick={() => setBalanceHidden(!balanceHidden)}>
            <span className={"hv2-change-amount " + (changeIsPositive ? "pos" : "neg")}>
              {balanceHidden ? "****" : ((changeIsPositive ? "+$" : "-$") + Math.abs(change24h.amount).toFixed(2))}
            </span>
            <span className={balanceHidden ? "" :"hv2-change-pill " + (changeIsPositive ? "pos" : "neg")}>
              
            </span>
          </div>
        </div>

        <div className="hv2-action-row">
          <button className="hv2-action-btn primary" onClick={() => navigate("/trade")}>
            <span>Trade</span>
          </button>
          <button className="hv2-action-btn primary" onClick={() => navigate("/send")}>
            <span>Send</span>
          </button>
        </div>
      </div>

      <div className="hv2-lower-area" ref={lowerAreaRef}>

        <div className="hv2-hidden-content" ref={hiddenContentRef}>
      

 {portfolio && (
        <div className="stks-hero" onClick={() => navigate("/stocks")}>
          <span className="stks-hero-label">Portfolio Value</span>
          <span className="stks-hero-value">{   balanceHidden ? "****" : "$" + portfolio.totalValue.toFixed(2)}</span>
          <span className={"stks-hero-change " +  (portfolio.todayChangeAmount >= 0 ? "pos" : "neg")}>
               {balanceHidden ? "****" : (portfolio.todayChangeAmount >= 0 ? "+$" : "-$") + Math.abs(portfolio.todayChangeAmount).toFixed(2) +
              " (" + (portfolio.todayChangePercent >= 0 ? "+" : "") + portfolio.todayChangePercent.toFixed(2) + "%) Today"}
          </span>
        </div>
      )}
<PortfolioComm balanceHidden={balanceHidden} />


 <div className="crdx-hero" onClick={() => navigate("/card")}>
        <span className="crdx-hero-label">Total Value</span>
        <span className="crdx-hero-value">{   balanceHidden ? "****" : formatUsd(card.balanceUsd || 0)}</span>
        <span className="crdx-hero-sub">{"Card ····" + (card.cardNumber || "").slice(-4)}</span>
      </div>


{/* <div className="hv2-nav-tiles-row">
  <div className="hv2-nav-tile" onClick={() => navigate("/rocket")}>
    <div className="hv2-nav-tile-icon"><RocketIcon /></div>
    <span className="hv2-nav-tile-label">Rocket</span>
  </div>
  <div className="hv2-nav-tile" onClick={() => enterP2P(navigate)}>
    <div className="hv2-nav-tile-icon"><P2PIcon /></div>
    <span className="hv2-nav-tile-label">P2P Market</span>
  </div>
</div> */}


        </div>



        <div className="hv2-force-block" ref={forceBlockRef}>
         <div
  className="hv2-handle-zone"
  onPointerDown={handlePointerDown}
   onClick={handleIslandClick}
  
>
            <div   className={`hv2-handle-bar ${handlePulse ? "hv2-handle-bar--pulse" : ""}`}></div>
          </div>

          <div className="hv2-force-scroll">
          

 

    <div className="hrd-summary-row">
         <div className="hrd-summary-card" onClick={() => navigate("/history")}>

  <span className="hrd-summary-value">Activity</span>
<span className="hrd-summary-label">View all</span>

  <span className="hrd-summary-value">
    {summary ? balanceHidden ? "****" : ("" + (summary.totalIncome - summary.totalExpense >= 0 ? "" : "") + (summary.totalIncome - summary.totalExpense).toFixed(2)) : "..."}
  </span>
  {summary && (
    <div className="hrd-summary-bar">
      {summary.categories.map(function (cat, idx) {
        var total = summary.categories.reduce(function (acc, c) { return acc + c.amount; }, 0) || 1;
        var pct = (cat.amount / total) * 100;
        var colors = ["#f0dfade0"];
        return <span key={cat.key} style={{ width: pct + "%", background: colors[idx % colors.length] }}></span>;
      })}
    </div>
  )}
</div>
          <div className="hrd-summary-card" onClick={() => navigate("/bonus")}>
            <span className="hrd-summary-label">Vouchers </span>
            <span className="hrd-summary-value">Rewards and vouchers</span>
            <span className="hrd-summary-cta">View all</span>
          </div>
        </div>
    
{/* 
   {cardsData && cardsData.cards.length == 0 && (
          <div className="bcx-empty-state" onClick={() => navigate("/balancecard")}>
            <span className="bcx-empty-title">No cards yet</span>
            <span className="bcx-empty-sub">Open your free Standard card to get started</span>
          </div>
        )}

{cardsData && cardsData.cards.length > 0 && (
  
  <div
    className="hrd-cards-stories"
    onClick={() => navigate("/balancecard")}
  >
     <div
      className="hrd-story-add"
      onClick={(e) => {
        e.stopPropagation();
        navigate("/balancecard");
      }}
    >
      <span>+</span>
    </div>
    {cardsData.cards.map(function (c) {
      return (
        <div key={c.id} className="hrd-story-card">
          <MiniCardThumb
            tier={c.tier}
            last4={c.cardNumber.slice(-4)}
            size="md"
          />

  
        </div>
      );
    })}

   
  </div>
)} */}



<div className="sav-stats-block" onClick={() => navigate("/savings")}>
  <span className="sav-stats-title">Earnings Overview</span>

  <div className="sav-stats-list">
    <div className="sav-stats-item">
      <span className="sav-s-label">Est. daily earnings</span>
      <span className="sav-s-dots"></span>
      <span className="sav-s-value">
         {balanceHidden ? "****" :  "$" + estDaily.toFixed(2)}
      </span>
    </div>

    <div className="sav-stats-item">
      <span className="sav-s-label">Est. monthly earnings</span>
      <span className="sav-s-dots"></span>
      <span className="sav-s-value">
           {balanceHidden ? "****" : "$" + estMonthly.toFixed(2)}
      </span>
    </div>

    <div className="sav-stats-item">
      <span className="sav-s-label">Est. yearly earnings</span>
      <span className="sav-s-dots"></span>
      <span className="sav-s-value">
           {balanceHidden ? "****" : "$" + estYearly.toFixed(2)}
      </span>
    </div>

    <div className="sav-stats-item">
      <span className="sav-s-label">Total deposited</span>
      <span className="sav-s-dots"></span>
      <span className="sav-s-value">
           {balanceHidden ? "****" : "$" + totalDeposited.toFixed(2)}
      </span>
    </div>
  
  </div></div>
    
    <div className="svc-grid-">
    
     <div className="svc-tile" onClick={() => navigate("/pixel")}>
              <span className="svc-tile-name">Pixel</span>
                <span className="svc-tile-desc">Minefield multiplier game</span>
              </div>
    
     <div className="svc-tile" onClick={() => navigate("/rocket")}>
              <span className="svc-tile-name">Rocket</span>
                <span className="svc-tile-desc">Crash-style multiplier game</span>
              </div>

</div>


          </div>
          
        </div>

      </div>
      
    </div>
  );
};
// onclick card
export default Home;
