import React, {useState, useRef, useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBalance, usePositions, useTradeHistory, useProfile, useTransfers } from './useBalance';
import history1 from "./history1.jpg"
import history2 from "./history2.jpg"
import history3 from "./history3.jpg"
import history4 from "./history4.jpg"
import { color } from "framer-motion";
import { title } from "framer-motion/client";

// npx vite --host 0.0.0.0 --port 5173 --force
// git add .
// git commit -m "add refresh from worked form"
// git push -u origin main 



// git push 
// rm -rf .git
// git init
// git checkout -b main
// git add .
// git commit -m "initial clean state"
// git branch -M main
// git remote add origin  https://github.com/xllavelia/xwallet-GO.git
// git push -f origin main


const Home = () => {
  
  const navigate = useNavigate();
  const balance = useBalance();
 var profile   = useProfile();
 var transfers = useTransfers();

 
const roadHomeLend = () => {
    navigate("/homelend");
  };

const roadSend = () => {
    navigate("/send");
  };

const roadBuy = () => {
    navigate("/buy");
  };

const roadGet = () => {
    navigate("/get");
  };

const roadSetting = () => {
    navigate("/setting");
  };

const roadHistory= () => {
    navigate("/history");
  };

const roadState = () => {
    navigate("/state");
  };
 
const roadBonus = () => {
    navigate("/bonus");
  };

const roadReferral = () => {
    navigate("/referral");
  };

  const roadCard = () => {

    navigate("/card");

  };

const roadCard2 = () => {
    navigate("/card2");
  };

const roadBattlePass = () => {
    navigate("/battlepass");
  };

  const roadAds = () => {
    navigate("/ads");
  };

    const roadPrime = () => {
    navigate("/prime");
  };


  var balanceStr = balance.toFixed();
  var balanceStr2 = balance.toFixed(2);

const transactionsDB = [
  {
    id: 1,
    name: "Starbucks Coffee",
    date: "October 17, 09:00 PM",
    amount: "-$44.80",
    bonus: "+$1.65",
     icon: <img src="https://i.pinimg.com/736x/14/55/09/145509e2e7c55b7ab8830545895b70c9.jpg" alt="" /> 
  },
  {
    id: 2,
     name: "Deposit USDT",
    date: "October 15, 08:15 AM",
    amount: "+$500.00",
    bonus: "+0.00",
    icon: <svg width="201px" height="201px" viewBox="0 0 201 201" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>USDT</title><desc>Created with Sketch.</desc><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Artboard" transform="translate(-1807.000000, -2361.000000)"><g id="USDT" transform="translate(1807.000000, 2361.000000)"><path d="M200.8206,100.4652 C200.8206,155.6942 156.0496,200.4652 100.8206,200.4652 C45.5916,200.4652 0.8206,155.6942 0.8206,100.4652 C0.8206,45.2362 45.5916,0.4652 100.8206,0.4652 C156.0496,0.4652 200.8206,45.2362 200.8206,100.4652" id="Fill-692" fill="#1BA27A"></path><polygon id="Fill-694" fill="#FFFFFF" points="147.7532 50.8914 53.0622 50.8914 53.0622 73.7504 88.9782 73.7504 88.9782 107.3504 111.8372 107.3504 111.8372 73.7504 147.7532 73.7504"></polygon>
 <path d="M100.6252,110.9305 C70.9142,110.9305 46.8282,106.2285 46.8282,100.4275 C46.8282,94.6275 70.9142,89.9245 100.6252,89.9245 C130.3352,89.9245 154.4212,94.6275 154.4212,100.4275 C154.4212,106.2285 130.3352,110.9305 100.6252,110.9305 M161.0302,102.1785 C161.0302,94.6985 133.9862,88.6345 100.6252,88.6345 C67.2642,88.6345 40.2192,94.6985 40.2192,102.1785 C40.2192,108.7645 61.1902,114.2525 88.9782,115.4695 L88.9782,163.7035 L111.8372,163.7035 L111.8372,115.4885 C139.8402,114.3095 161.0302,108.7995 161.0302,102.1785" id="Fill-696" fill="#FFFFFF"></path> </g> </g> </g></svg>
  },
  {
    id: 3,
   name: "Apple Store",
    date: "October 16, 12:30 PM",
    amount: "-$109.99",
    bonus: "+$5.50",
    icon: <img src="https://i.pinimg.com/736x/cf/11/eb/cf11ebcc0a874e3ad3830431f7b0ab58.jpg" alt="" />
  },

 {
    id: 4,
   name: "Windraft ETH",
    date: "October 17, 02:30 PM",
    amount: "-$100",
    bonus: "+0.00",
        icon: <img src="https://i.pinimg.com/474x/00/56/09/0056095969b13247cc2220891bbf5caf.jpg" alt="" />

  }
];

// 2. Стейт, в котором изначально лежит только первая транзакция
const [history, setHistory] = useState([transactionsDB[0]]);
const [clickCount, setClickCount] = useState(1);

// 3. Функция добавления новой карточки при клике
const handleAddTransaction = () => {
  if (clickCount < transactionsDB.length) {
    setHistory([ transactionsDB[clickCount], ...history]);
    setClickCount(clickCount + 1);
  }
};
const [rates, setRates] = useState(null);
  const [activeHistory, setActiveHistory] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";
        const res = await fetch(url);
        const data = await res.json();
        setRates(data);
      } catch (e) {
        console.error("Rates sync error");
      }
    };
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);


  
  const [bg, setBg] = useState("#000000");



// (импорты уже есть, добавь usePosition и useTradeHistory)

const position = usePositions();
const tradeHistory = useTradeHistory();

// стало:
function safeNum(val) { var n = parseFloat(val); return isNaN(n) ? 0 : n; }
var closedWins   = tradeHistory.filter(function(t) { return t.result === 'win'; });
var now          = Date.now();
var last24h      = tradeHistory.filter(function(t) { return now - safeNum(t.closeTime) < 86400000; });
var last7d       = tradeHistory.filter(function(t) { return now - safeNum(t.closeTime) < 604800000; });
var profit24h    = last24h.reduce(function(acc, t) { return acc + safeNum(t.pnl); }, 0);
var profit7d     = last7d.reduce(function(acc, t) { return acc + safeNum(t.pnl); }, 0);
var totalIncome  = tradeHistory.filter(function(t) { return safeNum(t.pnl) > 0; }).reduce(function(acc, t) { return acc + safeNum(t.pnl); }, 0);
var totalOutcome = tradeHistory.filter(function(t) { return safeNum(t.pnl) < 0; }).reduce(function(acc, t) { return acc + Math.abs(safeNum(t.pnl)); }, 0);
var activeTrades = position.length;
var winRate      = tradeHistory.length > 0 ? parseFloat(((closedWins.length / tradeHistory.length) * 100).toFixed(1)) : 0;
var cashbackEarned = tradeHistory.reduce(function(acc, t) { return acc + safeNum(t.fees) * 0.1; }, 0);

var profit24hStr  = (profit24h >= 0 ? '+' : '-') + Math.abs(profit24h).toFixed(2);
var profit7dStr   = (profit7d  >= 0 ? '+' : '-') + Math.abs(profit7d).toFixed(2);

const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [prices, setPrices] = useState({ BTC: '0.00', ETH: '0.00', SOL: '0.00', TON: '0.00' });

  const coins = [
    { id: 'BTC', name: 'Bitcoin', icon: '' },
    { id: 'ETH', name: 'Ethereum', icon: '' },
    { id: 'SOL', name: 'Solana', icon: '' },
    { id: 'TON', name: 'Toncoin', icon: '' }
  ];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT","TONUSDT"]');
        const data = await res.json();
        const p = {};
        data.forEach(i => p[i.symbol.replace('USDT', '')] = parseFloat(i.price));
        setPrices(p);
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    const inv = setInterval(fetchPrices, 10000);
    return () => clearInterval(inv);
  }, []);

  const handleTradeNav = (id) => {
    navigate('/trade', { state: { coin: id } });
    setIsSelectorOpen(false);
  };

var [refreshing, setRefreshing] = useState(false);

function handleRefresh() {
  setRefreshing(true);
  window.dispatchEvent(new Event("balance_update"));
  window.dispatchEvent(new Event("positions_update"));
  window.dispatchEvent(new Event("history_update"));
  window.dispatchEvent(new Event("transfers_update"));
  setTimeout(function () { setRefreshing(false); }, 700);
}

var recentTransfers = transfers.slice(0, 3);

  const TREND_COINS = [
  { id: 'BTC', symbol: 'BTCUSDT', name: 'Bitcoin', iconBg: '#f7931a', glyph: '₿' },
  { id: 'ETH', symbol: 'ETHUSDT', name: 'Ethereum', iconBg: '#627eea', glyph: 'Ξ' },
  { id: 'SOL', symbol: 'SOLUSDT', name: 'Solana', iconBg: '#14f195', glyph: '◎' },
  { id: 'TON', symbol: 'TONUSDT', name: 'Toncoin', iconBg: '#0098ea', glyph: '◆' }
];

const [trendData, setTrendData] = useState({});

useEffect(function() {
  function fetchTrend() {
    TREND_COINS.forEach(function(coin) {
      var url = 'https://api.binance.com/api/v3/klines?symbol=' + coin.symbol + '&interval=1h&limit=25';
      fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (!data || data.length < 2) return;
          var closes = data.map(function(d) { return parseFloat(d[4]); });
          var first = closes[0];
          var last = closes[closes.length - 1];
          var pct = ((last - first) / first) * 100;
          setTrendData(function(prev) {
            var next = Object.assign({}, prev);
            next[coin.id] = { price: last, changePct: pct, sparkline: closes };
            return next;
          });
        })
        .catch(function() {});
    });
  }
  fetchTrend();
  var iv = setInterval(fetchTrend, 30000);
  return function() { clearInterval(iv); };
}, []);

var trendCards = TREND_COINS.map(function(coin) {
  var d = trendData[coin.id];
  var hasData = d && d.sparkline && d.sparkline.length > 1;
  var pathD = '';
  var pct = 0;
  var priceStr = '...';
  var isPos = true;

  if (hasData) {
    var points = d.sparkline;
    var w = 100, h = 36;
    var min = Math.min.apply(null, points);
    var max = Math.max.apply(null, points);
    var range = (max - min) || 1;
    var coords = points.map(function(val, i) {
      var x = (i / (points.length - 1)) * w;
      var y = h - ((val - min) / range) * h;
      return x.toFixed(2) + ',' + y.toFixed(2);
    });
    pathD = 'M' + coords.join(' L');
    pct = d.changePct;
    isPos = pct >= 0;
    priceStr = d.price < 1
      ? d.price.toFixed(5)
      : d.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return {
    id: coin.id,
    name: coin.name,
    iconBg: coin.iconBg,
    glyph: coin.glyph,
    pathD: pathD,
    hasData: hasData,
    pctStr: (isPos ? ' +' : ' -') + Math.abs(pct).toFixed(2),
    priceStr: priceStr + ' $',
    isPos: isPos
  };
});


// const TicketCard = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = "XLAVELIA26";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  // };

const slides = [
  {
    id: 1,
    title: "  Prime",
    description: "gift, status, more possibilities.",
    actionText: "",
    // Сюда вставляй свой SVG код напрямую
    icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 28 28"><path fill="currentColor" d="M20.75 3a1 1 0 0 1 .78.375l.075.106l4.25 7a1 1 0 0 1-.015 1.063l-.077.102l-11 13a1 1 0 0 1-1.442.088l-.084-.088l-11-13a1 1 0 0 1-.15-1.052l.058-.113l4.25-7a1 1 0 0 1 .725-.473L7.25 3zm-3.235 9h-7.031l3.515 8.672zm5.329 0h-3.171l-2.917 7.195zM8.326 12H5.155l6.087 7.193zm1.348-7H7.811l-3.036 5h3.47zm6.572 0h-4.493l-1.429 5h7.351zm3.942 0h-1.863l1.429 5h3.47z" /></svg>)
  },
  {
    id: 2,
    title: "Send",
    description: "fast transaction, low fees.",
    actionText: "",
    icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" /><path fill="currentColor" d="M17.991 6.01L5.399 10.563l4.195 2.428l3.699-3.7a1 1 0 0 1 1.414 1.415l-3.7 3.7l2.43 4.194L17.99 6.01Zm.323-2.244c1.195-.433 2.353.725 1.92 1.92l-5.282 14.605c-.434 1.198-2.07 1.344-2.709.241l-3.217-5.558l-5.558-3.217c-1.103-.639-.957-2.275.241-2.709z" /></g></svg>) // Место под другой SVG
  },
  {
    id: 3,
    title: "Frend",
    description: "get 10% for fees, and more.",
    actionText: "",
    icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11q.825 0 1.413-.588Q14 9.825 14 9t-.587-1.413Q12.825 7 12 7q-.825 0-1.412.587Q10 8.175 10 9q0 .825.588 1.412Q11.175 11 12 11Zm0 2q-1.65 0-2.825-1.175Q8 10.65 8 9q0-1.65 1.175-2.825Q10.35 5 12 5q1.65 0 2.825 1.175Q16 7.35 16 9q0 1.65-1.175 2.825Q13.65 13 12 13Zm0 11q-2.475 0-4.662-.938q-2.188-.937-3.825-2.574Q1.875 18.85.938 16.663Q0 14.475 0 12t.938-4.663q.937-2.187 2.575-3.825Q5.15 1.875 7.338.938Q9.525 0 12 0t4.663.938q2.187.937 3.825 2.574q1.637 1.638 2.574 3.825Q24 9.525 24 12t-.938 4.663q-.937 2.187-2.574 3.825q-1.638 1.637-3.825 2.574Q14.475 24 12 24Zm0-2q1.8 0 3.375-.575T18.25 19.8q-.825-.925-2.425-1.612q-1.6-.688-3.825-.688t-3.825.688q-1.6.687-2.425 1.612q1.3 1.05 2.875 1.625T12 22Zm-7.7-3.6q1.2-1.3 3.225-2.1q2.025-.8 4.475-.8q2.45 0 4.463.8q2.012.8 3.212 2.1q1.1-1.325 1.713-2.95Q22 13.825 22 12q0-2.075-.788-3.887q-.787-1.813-2.15-3.175q-1.362-1.363-3.175-2.151Q14.075 2 12 2q-2.05 0-3.875.787q-1.825.788-3.187 2.151Q3.575 6.3 2.788 8.113Q2 9.925 2 12q0 1.825.6 3.463q.6 1.637 1.7 2.937Z"/></svg>
    ) // Место под третий SVG
  }
];


  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isVisible) return;
    
    // Автоматическое переключение каждые 5 секунд
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;



  const STORIES = [
  {
    id: 1,
    title: 'transfers',
    layout: 'top-left',
        text: 'Transfer funds to your loved ones quickly and securely, with no fees for the first 3 months.',
    slides: [
      {
        image:  history1,
        title: 'fast transfers \nwithout commissions',
        text: 'Transfer funds to your loved ones quickly and securely, with no fees for the first 3 months.',
      },
    ],
  },
  {
    id: 2,
    title: 'prime',
    layout: 'bottom-right',
        text: 'Buy a premium subscription, different plans to choose from, benefits, status, rewards',
    slides: [
      {
        image: history2,
        title: 'prime subscribe',
        text: 'Buy a premium subscription, different plans to choose from, benefits, status, rewards',
      },
      {
        image: history2,
        title: 'all in one subscription',
        text: 'Reduced fees, battle passes, vouchers, increased limits, all in one app – with prime',
      },
    ],
  },
  {
    id: 3,
    title: 'refferal',
    layout: 'center-right',
        text: 'Invite your friends and receive numerous rewards and bonuses',
    slides: [
      {
        image: history3,
        title: 'refferal system',
        text: 'Invite your friends and receive numerous rewards and bonuses',
      },
    ],
  },
  {
    id: 4,
    title: 'storage',
    layout: 'top-left',
        text: 'Store your cryptocurrency conveniently and securely',
    slides: [
      {
        image: history4,
        title: 'crypto storage',
        text: 'Store your cryptocurrency conveniently and securely',
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


function handleLogout() {
  localStorage.removeItem("xw_session");
  navigate("/");
}


return (
    
<div className="content" > 
  

 <div className="app-scroll-container">


      <section className="app-page-section">
        <div className="page-content"> <div className="crypto">

{/* <SpeedInsights/> */}

 <div className="crypto-layout">
      



      {/* 2. Total Balance */}
      <section className="balance-block">
        {/* <span className="label-dim">Total Assets</span> */}
        <div className="balance-main" onClick={roadHomeLend}>
          <span className="symbol" 
          // onClick={() => setIsOpen(true)}
          >usdt</span>
          <h1 className="amount" 
          // onClick={() => setIsOpen(true)}
          >{balanceStr}</h1>
        </div>
        <div className="pnl-summary">
     {/* <div onClick={handleRefresh}>  <span className="upLast" >{profit24hStr + ' at last 24h'}</span></div> */}
{/* <button className={'home-refresh-btn ' + (refreshing ? 'spinning' : '')} onClick={handleRefresh}>↻</button> */}
        </div>
      </section>


      <div className="actions-floating-grid">
        <div className="action-circle primary"  onClick={roadSend}>
          <div className="icon">

<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 15l6-6l6 6"/></svg>
</div>
      
        </div>
         <div className="action-circle x-primary" onClick={roadHistory}>
          <div className="icon">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 3"/></g></svg>
</div>
        </div>
        <div className="action-circle" onClick={roadReferral}>
          <div className="icon">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M19 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14M4 40.8V42h30v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496C27.92 28 25.68 28 21.2 28h-4.4c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C4 34.08 4 36.32 4 40.8" /><path d="M38 13v12zm-6 6h12z" clipRule="evenodd" /><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M38 13v12m-6-6h12" /></g></svg>        
            
            </div>
        </div>
        <div className="action-circle">
            
                    <div className="icon" onClick={roadBonus}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 6H6c-.932 0-1.398 0-1.766.152a2 2 0 0 0-1.082 1.083C3 7.602 3 8.068 3 9a3 3 0 1 1 0 6c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.082 1.083C4.602 18 5.068 18 6 18h8m0-12h4c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 7.602 21 8.068 21 9a3 3 0 1 0 0 6c0 .932 0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C19.398 18 18.932 18 18 18h-4m0-12v12"/></svg>
                    </div>
        </div>
      </div>
 









      <div className="ticket-wrapper-h" onClick={roadBattlePass}>
        <div className="ticket-main">
          <div className="tm-header">
            </div>
            




        <div className="battle-pass-center">

            <h2>
                BATTLE
                <br />
                PASS

            </h2>



            <div className="battle-pass-line"></div>

            <p>
                UNLOCK THE NEXT LEVEL
            </p>

        </div>

    </div>
    

        <div className="ticket-rip">
          <div className="hole hole-top"></div>
          <div className="rip-line"></div>
          <div className="hole hole-bottom"></div>
        </div>

        <div className="ticket-stub-h">
          <div className="ts-top">
            <div className="ts-serial">NO. 192789 <br /> S. 01</div>
            <div className="ts-barcode"></div>
          </div>
          <div className="ts-bottom"></div>
        </div>

      </div>
{/* 
 <div className="eb-container-parent">
 <div className="eb-container">
      <div className="eb-top-section" >
        <div className="eb-header-row">
          <span>Today's Profit</span>
          <svg className="eb-icon-eye" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        
        <div className="eb-main-balance">
       {profit24hStr + ' USD'}
        </div>

        <div className="eb-stats-grid">
          <div className="eb-stat-item">
             <div className="eb-stat-label">Total Profit</div>
            <div className="eb-stat-value">{(totalIncome - totalOutcome).toFixed(2) + ' USD'}</div>
          </div>
        
        </div>
      </div>

      <div className="eb-divider-h"></div>

      <div className="eb-assets-row">
        <div className="eb-asset-card" onClick={roadReferral}>
      
          <div className="eb-asset-info">
            <div className="eb-tag">infite frends</div>
            <div className="eb-asset-data">
              <span className="eb-asset-name">USDT</span>
              <span className="eb-asset-apr">0.3%</span>
            </div>
          </div>
        </div>

        <div className="eb-divider-v"></div>

        <div className="eb-asset-card" onClick={roadBonus}>
        
          <div className="eb-asset-info">
            <div className="eb-tag">Bonus</div>
            <div className="eb-asset-data">
              <span className="eb-asset-name">Gift Card</span>
              <span className="eb-asset-apr">100$</span>
            </div>
          </div>
        </div>
      </div>
    </div> 
    </div>   */}

 <div className="mc-wrapper">
      
      <div className="mc-scroll-area">
       {/* Блок добавления карты (Заглушка) */}
        <div className="mc-item mc-add-card"onClick={roadPrime}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z" /></svg> 
          
        </div>
        


        {/* Карточка 1: Лаймовая */}
        <div className={'mc-item mc-card ' + 'bg-lime'} onClick={roadCard}>
          <div className="mc-top">
            <div>
              <div className="mc-label">Current Balance</div>
              <div className="mc-balance">$17.24</div>
            </div>
            <div className="mc-contactless">
          
            </div>
          </div>

          <div className="mc-bottom">
            <div className="mc-info-row">
              <span>XLAVELIA LAGA</span>
              <span>08/24</span>
            </div>
            <div className="mc-number-row">
              <span>7901 **** **** 4581</span>
              <div className="mc-mastercard">
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#eb001b" fillOpacity="0.9"></circle>
                  <circle cx="22" cy="10" r="10" fill="#f79e1b" fillOpacity="0.9"></circle>
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>


 <div className="stories-root">
      <div className="stories-scroll">
        {STORIES.map(function (story, index) {
          return (
            // <button
              // key={story.id}
             
              // onClick={function () {
              //   openStory(index);
              // }}
            // >
               
            // </button>

           
          <div className="story-card"  key={story.id}
              onClick={function () {
                openStory(index);
              }} 
            >

            <article className="newsCard newsCardMain">
              {/* <span className="newsTag">UPDATE</span> */}
              <h4 style={{color: "var(--xlavelia)" }}>{story.title}</h4>
              <p className="text-story-card">{story.text}</p>
              {/* <span className="newsDate">Today · 2 min read</span> */}
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


    {/* <div className="carousel-container">
      <div 
        className="carousel-track" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div className="carousel-slide" key={slide.id}>
            <div className="slide-content">
              <div className="text-section">
                <h3>{slide.title}</h3>
                <p>{slide.description} </p>
                <button className="action-button">{slide.actionText}</button>
              </div>
              <div className="icon-section">
               
                {slide.icon ? slide.icon : <div className="svg-placeholder">place SVG</div>}
              </div>
            </div>
          </div>
        ))}
      </div>


      <div className="pagination">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div> */}
{/* 
 <div className="eb-container-parent">
 <div className="eb-container">
      <div className="eb-top-section" >
        <div className="eb-header-row">
          <span>Today's Profit</span>
          <svg className="eb-icon-eye" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        
        <div className="eb-main-balance">
       {profit24hStr + ' USD'}
        </div>

        <div className="eb-stats-grid">
          <div className="eb-stat-item">
             <div className="eb-stat-label">Total Profit</div>
            <div className="eb-stat-value">{(totalIncome - totalOutcome).toFixed(2) + ' USD'}</div>
          </div>
        
        </div>
      </div>

      <div className="eb-divider-h"></div>

      <div className="eb-assets-row">
        <div className="eb-asset-card" onClick={roadReferral}>
      
          <div className="eb-asset-info">
            <div className="eb-tag">infite frends</div>
            <div className="eb-asset-data">
              <span className="eb-asset-name">USDT</span>
              <span className="eb-asset-apr">0.3%</span>
            </div>
          </div>
        </div>

        <div className="eb-divider-v"></div>

        <div className="eb-asset-card" onClick={roadBonus}>
        
          <div className="eb-asset-info">
            <div className="eb-tag">Bonus</div>
            <div className="eb-asset-data">
              <span className="eb-asset-name">Gift Card</span>
              <span className="eb-asset-apr">100$</span>
            </div>
          </div>
        </div>
      </div>
    </div> 
    </div>  */}
    
<div className="trend-card-wrapper">
  {/* <div className="trend-header">
    <span className="trend-title">В тренде</span>
    <span className="trend-all">Все</span>
  </div> */}

  <div className="trend-grid">
    {trendCards.map(function(card) {
      return (
        <div key={card.id} className="trend-item" onClick={() => handleTradeNav(card.id)}>
          <div className="trend-item-top">
            {/* <div className="trend-icon" style={{backgroundColor: card.iconBg}}>{card.glyph}</div> */}
            {/* <svg className="trend-chart" viewBox="0 0 100 36" preserveAspectRatio="none">
              {card.hasData && (
                <path
                  d={card.pathD}
                  fill="none"
                  stroke="hsl(61, 85%, 78%)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg> */}
          </div>
          <div className="trend-row-bottom">
            <span className="trend-ticker">{card.id}</span>
            <span className={'trend-badge ' + (card.isPos ? 'pos' : 'neg')}>{card.pctStr}</span>
          </div>
          <div className="trend-price">{card.priceStr}</div>
        </div>
      );
    })}
  </div>
</div>

  
   </div>

          </div> </div>

      </section>

    </div>

  </div>);
}
export default Home;