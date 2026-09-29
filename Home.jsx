import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "./useAccount";
import { useWalletBalance } from "./useWallet";
import { useClosedPositionsRemote } from "./usePositions";
import { useBankCards } from "./useBankCards";
import { useHomeSummary } from "./useHomeSummary";
// import history1 from './history1.jpg';
// import history2 from './history2.jpg';
// import history3 from './history3.jpg';
// import history4 from './history4.jpg';
import { MiniCardThumb } from "./bankCardVisuals";
import { useStockPortfolio } from "./useStocks";
import { useCard } from "./useCard";
import PortfolioComm from "./PortfolioComm";
import { RewardsPickerModal, MiniGamesModal } from "./HomePickers";
import { useSavings} from "./useSavings";


//npx vite --host 0.0.0.0 --port 5173 --force
// git add .
// git commit -m "create slots!"
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



function getGreeting() {
  var h = new Date().getHours();
  if (h < 12) return "Welcome";
  if (h < 18) return "Hello";
  return "Evening";
}


function formatUsd(n) { return "$" + n.toFixed(2); }



const Home = () => {
  const navigate = useNavigate();

  var { account } = useAccount();
  var { wallet } = useWalletBalance();
  var { closedPositions } = useClosedPositionsRemote();

//  var { data: cardsData } = useBankCards();
  var summary = useHomeSummary();

var [picker, setPicker] = useState(null); // "rewards" | "games"

  var { savings } = useSavings();

  var { portfolio } = useStockPortfolio();
  var { card } = useCard();


  var avatarInitial = account && account.username ? account.username[0].toUpperCase() : "?";
  var username = account ? account.username : "";
var { savings } = useSavings();


var estMonthly = savings
  ? savings.balance * (savings.interestRate / 100) / 12
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
  if (!clickMode) return;

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
  if (clickMode) return;

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
          <button className="hv2-action-btn primary" onClick={() => navigate("/mining")}>
            <span>Mine</span>
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

<div className="hrd-summary-card" onClick={() => setPicker("rewards")}>
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

<button className="hmp-games-teaser" onClick={() => setPicker("games")}>
  <span className="hmp-shine"></span>
  <div className="hmp-gt-left">
    <span className="hmp-gt-kicker">Mini Games</span>
    <span className="hmp-gt-list">Empire · Pixel and more</span>
    <span className="hmp-gt-live"><span className="hmp-gt-dot"></span>Empire is live</span>
  </div>
  <span className="hmp-gt-cta">Play</span>
</button>


 {portfolio && (
        <div className="stks-hero" onClick={() => navigate("/savings")}>
          <span className="stks-hero-label">Portfolio Value</span>
          <span className="stks-hero-value">{balanceHidden ? "****" : "$" +  (savings?.balance ?? 0)}</span>
          <span className={"stks-hero-change " +  (portfolio.todayChangeAmount >= 0 ? "pos" : "neg")}>
               {balanceHidden ? "****" : "$" + estMonthly.toFixed(2) } - Est. monthly earn.
          </span>
        </div>
      )}
      

          </div>
        </div>

      </div>
      {picker === "rewards" && <RewardsPickerModal onClose={() => setPicker(null)} />}
{picker === "games" && <MiniGamesModal onClose={() => setPicker(null)} />}
    </div>
  );
};

export default Home;
