import React, {useState, useRef, useEffect} from "react";
  import { useNavigate } from "react-router-dom";

// git add .
//  git commit -m "added progress row with percent"
// git push origin master

// npx vite --host 0.0.0.0 --port 5173 --force

//  git add .
// git commit -m "real trade page and remake crypto select coin!"
// git push origin main



const Home = () => {
  const navigate = useNavigate();
//   let balanceGoalNow = 7.58
// let balansPRGoalNow = "7.90%"
//    const createGoalRef = useRef(null);
//    const deleteGoalOld = useRef(null);
//    const finalGoal= useRef(null);
//    const infoFinalGoal = useRef(null);
// const [name, setName] = useState("");
// const [dollar, setDollar] = useState("");
// const [photo, setPhoto] = useState(null);
//  const GoalLendParent1 = useRef(null);
//  const GoalLendParent2 = useRef(null);
//  const GoalLendParent3 = useRef(null);
//  const kartaChildrenRef = useRef(null);
// useEffect(() => {
//   const container = kartaChildrenRef.current;

//   if (!container) return;

//   const middle =
//     container.children[Math.floor(container.children.length / 2)];

//   middle.scrollIntoView({
//     behavior: "auto",
//     inline: "center",
//   });
// }, []);

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


// const roadHome = () => {
//     navigate("/");
//   };


// function HomeGoalPlusBtn1(event) {
//   event.stopPropagation();
  
//   if (GoalLendParent.current) {
//     GoalLendParent1.current.style.transition = "opacity 0.6s";
//     GoalLendParent1.current.style.opacity = "1";
//     GoalLendParent1.current.style.pointerEvents = "auto";
//         kartaChildrenRef.current.style.pointerEvents = "none";
     
//   }
// }

// useEffect(() => {
//   function handleClickOutside(event) {
//     if (
//       GoalLendParent1.current &&
//       !GoalLendParent1.current.contains(event.target)
//     ) {
//       GoalLendParent1.current.style.opacity = "0";
//       GoalLendParent1.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
     
//     }
//   }

//   document.addEventListener("click", handleClickOutside);

//   return () => {
//     document.removeEventListener("click", handleClickOutside);
//   };
// }, []);



// function HomeGoalPlusBtn2(event) {
//   event.stopPropagation();
  
//   if (GoalLendParent.current) {
//     GoalLendParent2.current.style.transition = "opacity 0.6s";
//     GoalLendParent2.current.style.opacity = "1";
//     GoalLendParent2.current.style.pointerEvents = "auto";
//         kartaChildrenRef.current.style.pointerEvents = "none";
     
//   }
// }

// useEffect(() => {
//   function handleClickOutside(event) {
//     if (
//       GoalLendParent2.current &&
//       !GoalLendParent2.current.contains(event.target)
//     ) {
//       GoalLendParent2.current.style.opacity = "0";
//       GoalLendParent2.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
     
//     }
//   }

//   document.addEventListener("click", handleClickOutside);

//   return () => {
//     document.removeEventListener("click", handleClickOutside);
//   };
// }, []);



// function HomeGoalPlusBtn3(event) {
//   event.stopPropagation();
  
//   if (GoalLendParent.current) {
//     GoalLendParent3.current.style.transition = "opacity 0.6s";
//     GoalLendParent3.current.style.opacity = "1";
//     GoalLendParent3.current.style.pointerEvents = "auto";
//         kartaChildrenRef.current.style.pointerEvents = "none";
     
//   }
// }

// useEffect(() => {
//   function handleClickOutside(event) {
//     if (
//       GoalLendParent.current &&
//       !GoalLendParent.current.contains(event.target)
//     ) {
//       GoalLendParent3.current.style.opacity = "0";
//       GoalLendParent3.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
     
//     }
//   }

//   document.addEventListener("click", handleClickOutside);

//   return () => {
//     document.removeEventListener("click", handleClickOutside);
//   };
// }, []);





//  const GoalLendParent = useRef(null);
  


// function HomeGoalPlusBtn(event) {
//   event.stopPropagation();
  
//   if (GoalLendParent.current) {
//     GoalLendParent.current.style.transition = "opacity 0.6s";
//     GoalLendParent.current.style.opacity = "1";
//     GoalLendParent.current.style.pointerEvents = "auto";
//         kartaChildrenRef.current.style.pointerEvents = "none";
     
//   }
// }

// useEffect(() => {
//   function handleClickOutside(event) {
//     if (
//       GoalLendParent.current &&
//       !GoalLendParent.current.contains(event.target)
//     ) {
//       GoalLendParent.current.style.opacity = "0";
//       GoalLendParent.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
     
//     }
//   }

//   document.addEventListener("click", handleClickOutside);

//   return () => {
//     document.removeEventListener("click", handleClickOutside);
//   };
// }, []);


// const fileRef = useRef(null);
// const [image, setImage] = useState(null);
// const [preview, setPreview] = useState(null);

// function openFilePicker() {
//   fileRef.current.click();
// }


// function inputNameFunc(e) {
//   setName(e.target.value);

// }

// function handleFileChange(e) {
//   const file = e.target.files[0];
//   if (file) {
//     setImage(URL.createObjectURL(file));
//   }
//     if (!file) return
//   setPhoto(file)
//   const  imageUrl = URL.createObjectURL(file)
//   setPreview(imageUrl)

// }
// const [amount, setAmount] = useState("");

// function handleChange(e) {
//   let numbers = e.target.value.replace(/\D/g, "");
//   setDollar(e.target.value);

//   if (numbers === "") {
//     setAmount("");
//     return;
//   }

//   let intPart = numbers.slice(0, -2);
//   if (intPart === "") intPart = "0";

//   let decimalPart = numbers.slice(-2);
//   if (decimalPart.length < 2) {
//     decimalPart = decimalPart.padStart(2, "0");
//   }

//   let formattedInt = Number(intPart).toLocaleString("en-US");

//   setAmount(formattedInt + "." + decimalPart);
// }

// const [activeButtons, setActiveButtons] = React.useState([]);

// function toggleButton(index) {
//   setActiveButtons(function(previousState) {
//     let newState = [];
//     let isAlreadyActive = false;

//     // Проверяем — есть ли уже эта кнопка в массиве
//     for (let i = 0; i < previousState.length; i++) {
//       if (previousState[i] === index) {
//         isAlreadyActive = true;
//       }
//     }

//     // Если кнопка уже активна — убираем её
//     if (isAlreadyActive === true) {
//       for (let i = 0; i < previousState.length; i++) {
//         if (previousState[i] !== index) {
//           newState.push(previousState[i]);
//         }
//       }

//       // Проверка — сколько активных осталось
//       const allThreeActive = newState.length === 3;
//       console.log("Все три кнопки активны?", allThreeActive);

//       return newState;
//     }

//     // Если уже 3 активных — больше не добавляем
//     if (previousState.length >= 3) {
//       console.log("Нельзя активировать больше 3 кнопок");
//       return previousState;
//     }

//     // Иначе добавляем новую кнопку
//     for (let i = 0; i < previousState.length; i++) {
//       newState.push(previousState[i]);
//     }

//     newState.push(index);

//     // Проверка — все 3 кнопки активны?
//     const allThreeActive = newState.length === 3;
//     console.log("три кнопки активны?", allThreeActive);

//     return newState;
//   });
// }

// function  createGoal(event) {
//   event.stopPropagation();
  
//   if (GoalLendParent.current) {
//     GoalLendParent.current.style.opacity = "0";
//       GoalLendParent.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
//       deleteGoalOld.current.style.display = "none";
//      finalGoal.current.style.display = "flex";
//   }
// }


// console.log(name)
// console.log(dollar)




// function infoFinalGoalFunc(event) {
//   event.stopPropagation();
  
//   if (infoFinalGoal.current) {
//     infoFinalGoal.current.style.transition = "opacity 0.6s";
//     infoFinalGoal.current.style.opacity = "1";
//     infoFinalGoal.current.style.pointerEvents = "auto";
//         kartaChildrenRef.current.style.pointerEvents = "none";
     
//   }
// }

// useEffect(() => {
//   function handleClickOutside(event) {
//     if (
//       infoFinalGoal.current &&
//       !infoFinalGoal.current.contains(event.target)
//     ) {
//       infoFinalGoal.current.style.opacity = "0";
//       infoFinalGoal.current.style.pointerEvents = "none";
//         kartaChildrenRef.current.style.pointerEvents = "auto";
     
//     }
//   }

//   document.addEventListener("click", handleClickOutside);

//   return () => {
//     document.removeEventListener("click", handleClickOutside);
//   };
// }, []);


// useEffect(() => {
//   if (! createGoalRef.current) return;

//   if (name.trim() === "" || Number(amount) === 0 || activeButtons.length != 3) {
//      createGoalRef.current.style.pointerEvents = "none";
//      createGoalRef.current.style.opacity = "0.5"; // чтобы было видно что disabled
//   } else {
//      createGoalRef.current.style.pointerEvents = "auto";
//      createGoalRef.current.style.opacity = "1";
//   }
// }, [name, amount,activeButtons ]);

// 1. Тот самый шаблонный массив с данными
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


  const [isOpen, setIsOpen] = useState(false);

  // Расширенные данные для статистики
  const totalBalance = 789.00;
  const profit24h = 12.98;
  const profit7d = 70.54;
  const totalIncome = 4500.00;
  const totalOutcome = 2009.50;
  
  // Дополнительная статистика
  const activeTrades = 12;
  const winRate = 78.5;
  const cashbackEarned = 145.50;

const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [prices, setPrices] = useState({ BTC: '0.00', ETH: '0.00', SOL: '0.00', TON: '0.00' });

  const coins = [
    { id: 'BTC', name: 'Bitcoin', icon: '₿' },
    { id: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { id: 'SOL', name: 'Solana', icon: '◎' },
    { id: 'TON', name: 'Toncoin', icon: '♦' }
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


  return (
    
<div className="content" > 

 <div className="app-scroll-container">
{/*       
      <div className="app-page-section"  style={{
        background: bg
      }} >
        <div className="page-content">


  <div className="header">
    <h1 className="header-text">Hello. xlav!</h1>
  </div>

<div className="home-cart-parent">
  <div  className="home-cart" onClick={() => setActiveCard(!activeCard)}>


    <h6 className="name-cart">VISA</h6>
    <div className="balance-parent">
      <h5 className="balance-text">Balance</h5>
      <h1 className="balance">$471</h1>
      <h6 className="number-cart">8720 8261 2541 9267</h6>
      <h5 className="cart-id">cart id: <span className="span-copy-balance"> 19207145</span></h5>
    </div> 
    {activeCard && (
      
    <div className="trade-details-dropdown-home">
      <div className="detail-row-home"><span>Cashback:</span> <span>1.00%</span></div>
      <div className="detail-row-home"><span>Balance:</span> <span>$471.00</span></div>
      <div className="detail-row-home"><span>Owner:</span> <span>xlav</span></div>
      <div className="detail-row-home"><span>ID:</span> <span>19207145</span></div>
      <div className="detail-row-home"><span>NWC:</span> <span>active</span></div>
      <div className="detail-row-home"><span>Income:</span> <span>$571</span></div>
      <div className="detail-row-home"><span>Outcome:</span> <span>$100</span></div>
      <div className="detail-row-home"><span>Counry:</span> <span>Russia</span></div>

      <div className="detail-row-home"><span>Network:</span> <span className="hash-text">Mainnet</span></div>
    </div>
  )}
  </div>

 
  <div className="not-cart"> 
    <div className="cart-nwc">
    </div>
    
    <div className="create-cart"  onClick={() => setIsVisible(!isVisible)}>
 
    </div>


  </div>
</div>

 <div className={"custom-elements " + (isVisible ? "show" : "hide")}>

      <div className="actions-floating-grid-home">
        <div className="action-circle-home primary-home">
          <div className="icon-home" onClick={roadSend}>↑</div>
          <span style={{
    color: "hsl(70, 80%, 80%)" ,
    backgroundColor: "hsl(162, 50%, 15%)"
  }}     >Send</span>
        </div>
        <div className="action-circle-home">
          <div className="icon-home" onClick={roadBuy}>$
          <span>Swap</span>
          </div>
        </div>
        <div className="action-circle-home">
          <div className="icon-home" onClick={roadGet}>↓</div>
          <span>Get</span>
        </div>
      </div>
      
</div>

 */}




      <section className="app-page-section"  style={{
        background: bg
      }}>
        <div className="page-content"> <div className="crypto">



 <div className="crypto-layout">
      



      {/* 2. Total Balance */}
      <section className="balance-block">
        {/* <span className="label-dim">Total Assets</span> */}
        <div className="balance-main">
          <span className="symbol" onClick={() => setIsOpen(true)}>usdt</span>
          <h1 className="amount" onClick={() => setIsOpen(true)}>789.00</h1>
        </div>
        <div className="pnl-summary">
          <span className="upLast" onClick={() => setIsOpen(true)}>+2.4% last 24h</span>
        </div>
      </section>


      <div className="actions-floating-grid">
        <div className="action-circle primary"  onClick={roadSend}>
          <div className="icon">↑</div>
          {/* <span style={{
    color: "hsl(70, 80%, 80%)" ,
    backgroundColor: "hsl(162, 50%, 15%)"
  }}     >Send</span> */}
        </div>
         <div className="action-circle x-primary" onClick={roadHistory}>
          <div className="icon"><svg height="45%" version="1.1" viewBox="0 0 24 24" width="100%" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:serif="http://www.serif.com/" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Icon"><path d="M12,2.25c-5.381,0 -9.75,4.369 -9.75,9.75c0,5.381 4.369,9.75 9.75,9.75c5.381,0 9.75,-4.369 9.75,-9.75c0,-5.381 -4.369,-9.75 -9.75,-9.75Zm0,1.5c4.553,0 8.25,3.697 8.25,8.25c0,4.553 -3.697,8.25 -8.25,8.25c-4.553,0 -8.25,-3.697 -8.25,-8.25c0,-4.553 3.697,-8.25 8.25,-8.25Z"/><path d="M11.25,7l0,4.586c-0,0.464 0.184,0.909 0.513,1.237c0.754,0.755 2.707,2.707 2.707,2.707c0.292,0.293 0.768,0.293 1.06,0c0.293,-0.292 0.293,-0.768 0,-1.06c0,-0 -1.952,-1.953 -2.707,-2.707c-0.047,-0.047 -0.073,-0.111 -0.073,-0.177c0,-1.199 0,-4.586 0,-4.586c0,-0.414 -0.336,-0.75 -0.75,-0.75c-0.414,-0 -0.75,0.336 -0.75,0.75Z"/></g></svg>
</div>
          {/* <span>Swap</span> */}
        </div>
        <div className="action-circle" onClick={roadBuy}>
          <div className="icon">⇄</div>
          {/* <span>Swap</span> */}
        </div>
        <div className="action-circle">
          <div className="icon" onClick={roadGet}>↓</div>
          {/* <span>Get</span> */}
        </div>
      </div>
 

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
          12.98 USD
          {/* <svg className="eb-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg> */}
        </div>

        <div className="eb-stats-grid">
          <div className="eb-stat-item">
             <div className="eb-stat-label">Total Profit</div>
            <div className="eb-stat-value">79,21 USD</div>
          </div>
        
        </div>
      </div>

      <div className="eb-divider-h"></div>

      <div className="eb-assets-row">
        <div className="eb-asset-card" onClick={roadReferral}>
          {/* <div className="eb-asset-icon usdt-bg">
            <span className="eb-icon-symbol">₮</span>
          </div> */}
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
          {/* <div className="eb-asset-icon eth-bg">
            <span className="eb-icon-symbol">Ξ</span>
          </div> */}
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
    </div>  

 <div className="mc-wrapper">
      
      <div className="mc-scroll-area">
        
        {/* Блок добавления карты (Заглушка) */}
        <div className="mc-item mc-add-card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
            <line x1="12" y1="15" x2="16" y2="15"></line>
            {/* Имитация плюсика рядом */}
            <line x1="26" y1="12" x2="30" y2="12"></line>
            <line x1="28" y1="10" x2="28" y2="14"></line>
          </svg>
        </div>

        {/* Карточка 1: Лаймовая */}
        <div className={'mc-item mc-card ' + 'bg-lime'} onClick={roadCard}>
          <div className="mc-top">
            <div>
              <div className="mc-label">Current Balance</div>
              <div className="mc-balance">$17.24</div>
            </div>
            <div className="mc-contactless">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 21.3c-2.8-2.6-4.5-6.4-4.5-10.6 0-4.2 1.7-8 4.5-10.6"></path>
                <path d="M12.5 18.5c-2-1.9-3.2-4.6-3.2-7.6 0-3 1.2-5.7 3.2-7.6"></path>
                <path d="M16 15.2c-1.1-1.1-1.8-2.6-1.8-4.3 0-1.7.7-3.2 1.8-4.3"></path>
                <path d="M19 12c0-.8-.3-1.6-.8-2.2"></path>
              </svg>
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

        {/* Карточка 2: Белая */}
        <div className={'mc-item mc-card ' + 'bg-white'} onClick={roadCard2}>
          <div className="mc-top">
            <div>
              <div className="mc-label">Current Balance</div>
              <div className="mc-balance">$0.00</div>
            </div>
            <div className="mc-contactless">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 21.3c-2.8-2.6-4.5-6.4-4.5-10.6 0-4.2 1.7-8 4.5-10.6"></path>
                <path d="M12.5 18.5c-2-1.9-3.2-4.6-3.2-7.6 0-3 1.2-5.7 3.2-7.6"></path>
                <path d="M16 15.2c-1.1-1.1-1.8-2.6-1.8-4.3 0-1.7.7-3.2 1.8-4.3"></path>
                <path d="M19 12c0-.8-.3-1.6-.8-2.2"></path>
              </svg>
            </div>
          </div>

          <div className="mc-bottom">
            <div className="mc-info-row">
              <span>XLAVELIA LAGA</span>
              <span>12/26</span>
            </div>
            <div className="mc-number-row">
              <span>1234 **** **** 1234</span>
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


 <div className="home-wrapper">
      
      {/* МОНОЛИТНАЯ КАРТА */}
      <div className="unified-card" onClick={() => setIsSelectorOpen(true)}>
        
        {/* ВЕРХНИЙ БЛОК: КУРСЫ СО СКРОЛЛОМ */}
        <div className="uc-rates-scroll">
          {Object.entries(prices).map(([ticker, val]) => (
            <div key={ticker} className="uc-rate-item">
              <span className="uc-ticker">{ticker}</span>
              <span className="uc-price">{'$' + val.toLocaleString()}</span>
            </div>
          ))}
        </div>

      <div className="ms-container">
      
      <div className="ms-mini-card">
        <div className="ms-label">capitalization</div>
        <div className="ms-value">2,42 trill $</div>
        <div className={'ms-change ' + 'neg'}>-2,03 %</div>
      </div>

      <div className="ms-mini-card">
        <div className="ms-label">volume</div>
        <div className="ms-value">101,78 bill $</div>
        <div className={'ms-change ' + 'pos'}>+15,53 %</div>
      </div>

      <div className="ms-mini-card">
        <div className="ms-label">dominance</div>
        <div className="ms-value">56,30 %</div>
        <div className="ms-subtext">Bitcoin</div>
      </div>

    </div>
      </div>

      {/* ЛЕНДИНГ ВЫБОРА МОНЕТ (MODAL) */}
      {isSelectorOpen && (
        <div className="lend-overlay" onClick={() => setIsSelectorOpen(false)}>
          <div className="lend-modal" onClick={e => e.stopPropagation()}>
            <div className="lend-handle"></div>
            <h2 className="lend-title">Select Asset</h2>
            <div className="lend-list">
              {coins.map(c => (
                <div key={c.id} className="lend-item" onClick={() => handleTradeNav(c.id)}>
                  <div className="lend-left">
                    <div className="lend-icon">{c.icon}</div>
                    <div className="lend-info">
                      <span className="lend-name">{c.name}</span>
                      <span className="lend-ticker">{c.id + ' / USDT'}</span>
                    </div>
                  </div>
                  <div className="lend-price">
                    {'$' + (prices[c.id] || '0.00')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  
      {/* <section className="revenue-stats">
        <div className="rev-item">
          <span className="rev-label">Today PnL</span>
          <span className="rev-val up"> <span>+$1,240.50</span></span>
        </div>
        <div className="rev-item divider"></div>
        <div className="rev-item">
          <span className="rev-label">7D Profit</span>
          <span className="rev-val">+$8,900.00</span>
        </div>
      </section> */}

{/* 
      <section className="history-section">
        <h3 className="section-title">Trade History</h3>
        <div className="trades-list">
          {trades.map((t) => (
            <div 
              className={"trade-item " + (activeHistory === t.id ? "expanded" : "")} 
              key={t.id}
              onClick={() => setActiveHistory(activeHistory === t.id ? null : t.id)}
            >
              <div className="trade-main-info">
                <div className="trade-left">
                  <div className="type-icon">{t.type[0]}</div>
                  <div>
                    <div className="trade-asset">{t.asset}</div>
                    <div className="trade-date">{t.date}</div>
                  </div>
                </div>
                <div className="trade-right">
                  <div className="trade-amount">{t.amount}</div>
                  <div className="trade-id-short">{t.id}</div>
                </div>
              </div>
              {activeHistory === t.id && (
                <div className="trade-details-dropdown">
                  <div className="detail-row"><span>Status:</span> <span>{t.status}</span></div>
                  <div className="detail-row"><span>Network Fee:</span> <span>0.0001 BTC</span></div>
                  <div className="detail-row"><span>Hash:</span> <span className="hash-text">0x882...fa11</span></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section> */}
 <div className={'bo-overlay' + (isOpen ? ' open' : '')}>
        
        {/* Клик по фону закрывает окно */}
        <div className="bo-backdrop" onClick={() => setIsOpen(false)}></div>

        {/* ОСТРОВ-ТИКЕТ ПО ЦЕНТРУ */}
        <div className={'bo-ticket' + (isOpen ? ' open' : '')}>
          
          <div className="bo-ticket-inner">
            {/* ШАПКА ТИКЕТА */}
            <div className="bo-header">
              <div className="bo-col">
                <span className="bo-label">PORTFOLIO</span>
                <span className="bo-status">LIVE</span>
              </div>
              <button className="bo-close-btn" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            {/* ГЛАВНЫЙ БАЛАНС */}
            <div className="bo-main-balance">
              <span className="bo-bal-label">TOTAL BALANCE</span>
              <span className="bo-bal-val">
                {'$ ' + totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bo-divider"></div>

            {/* БЛОК ПРОФИТА (24ч и 7д) */}
            <div className="bo-row">
              <div className="bo-col">
                <span className="bo-label">24H PROFIT</span>
                <span className="bo-val-bold">{'+$ ' + profit24h.toFixed(2)}</span>
              </div>
              <div className="bo-col right">
                <span className="bo-label">7D PROFIT</span>
                <span className="bo-val-bold">{'+$ ' + profit7d.toFixed(2)}</span>
              </div>
            </div>

            <div className="bo-divider"></div>

            {/* РАСШИРЕННАЯ СТАТИСТИКА */}
            <div className="bo-stats-list">
              <div className="bo-stat-item">
                <span className="bo-s-label">Total Income</span>
                <span className="bo-s-dots"></span>
                <span className="bo-s-val">{'$ ' + totalIncome.toLocaleString()}</span>
              </div>
              <div className="bo-stat-item">
                <span className="bo-s-label">Total Outcome</span>
                <span className="bo-s-dots"></span>
                <span className="bo-s-val">{'$ ' + totalOutcome.toLocaleString()}</span>
              </div>
              <div className="bo-stat-item">
                <span className="bo-s-label">Active Trades</span>
                <span className="bo-s-dots"></span>
                <span className="bo-s-val">{activeTrades + ' Open'}</span>
              </div>
              <div className="bo-stat-item">
                <span className="bo-s-label">Average Win Rate</span>
                <span className="bo-s-dots"></span>
                <span className="bo-s-val">{winRate + '%'}</span>
              </div>
              <div className="bo-stat-item">
                <span className="bo-s-label">Cashback Earned</span>
                <span className="bo-s-dots"></span>
                <span className="bo-s-val">{'$ ' + cashbackEarned.toFixed(2)}</span>
              </div>
            </div>
<button className="bo-settings-btn" onClick={roadSetting}>
              {/* <span className="set-icon">⚙</span> */}
              <span className="set-text">SYSTEM PREFERENCES</span>
            </button>

          </div>
          
          {/* Боковой корешок для стиля тикета */}
          <div className="bo-ticket-stub">
            <span className="stub-text">SYS-BAL-01</span>
            <div className="stub-barcode"></div>
          </div>

        </div>
      </div> </div>

          </div> </div>

      </section>

    </div>

  </div>);
}
export default Home;