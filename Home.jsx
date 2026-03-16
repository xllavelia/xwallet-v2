import React, {useState, useRef} from "react";
  // import { useNavigate } from "react-router-dom";

// git add .
//  git commit -m "added progress row with percent"
// git push origin master

// npx vite --host 0.0.0.0 --port 5173 --force

 git add .
git commit -m "transaction!"
git push origin main



const Home = () => {
//   let balanceGoalNow = 7.58
// let balansPRGoalNow = "7.90%"
//    const createGoalRef = useRef(null);
//    const deleteGoalOld = useRef(null);
//    const finalGoal= useRef(null);
//    const infoFinalGoal = useRef(null);
//   const navigate = useNavigate();
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

// const roadCrypto = () => {
//     navigate("/crypto");
//   };

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

return (
    
<div className="content"> 
  <div className="not-scroll">

  <div className="header">
    <h1 className="header-text">Hello, kovrik!</h1>
  </div>

<div className="home-cart-parent">
  <div className="home-cart">
    <h6 className="name-cart">VISA</h6>
    <div className="balance-parent">
      <h5 className="balance-text">Balance</h5>
      <h1 className="balance">$471</h1>
      <h6 className="number-cart">8720 8261 2541 9267</h6>
      <h5 className="cart-id">cart id: <span className="span-copy-balance"> 19207145 </span></h5>
    </div>
  </div>

  {/* Теперь этот блок держит всё на своих местах */}
  <div className="not-cart"> 
    <div className="cart-nwc">
    </div>
    
    <div className="create-cart">
      <svg className="create-cart-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 20L12 12M12 12L12 4M12 12L20 12M12 12L4 12" 
          stroke="" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  </div>
</div>

<div  className="crypto-mini-cards-container">

  <div  className="crypto-mini-card">
    <div  className="mini-card-header">
      <div>
        {/* <div  className="mini-card-icon icon-btc">₿</div> */}
        <div  className="mini-card-title">Bitcoin</div>
      </div>
      <div  className="mini-card-rate">1 BTC = $71,509</div>
    </div>
    <div  className="mini-card-balance-section">
      <div  className="mini-card-crypto-balance">0,0091 BTC</div>
      <div  className="mini-card-fiat-balance">$678.2</div>
    </div>
    <div  className="mini-card-profit-section">
      <div  className="mini-card-profit-title">Profit (24h)</div>
      <div  className="mini-card-profit-usd">+$1,237.45</div>
      <div  className="mini-card-profit-percent">+5%</div>
    </div>
    <div  className="mini-card-actions">
      <button  className="btn-mini-card btn-swap">Swap</button>
      <button  className="btn-mini-card btn-buy">Buy</button>
      <button  className="btn-mini-card btn-send">Send</button>
    </div>
  </div>
  
  <div  className="crypto-mini-card">
    <div  className="mini-card-header">
      <div>
        {/* <div  className="mini-card-icon icon-eth">Ξ</div> */}
        <div  className="mini-card-title">Ethereum</div>
      </div>
      <div  className="mini-card-rate">1 ETH = $2,048</div>
    </div>
    <div  className="mini-card-balance-section">
      <div  className="mini-card-crypto-balance">7 ETH</div>
      <div  className="mini-card-fiat-balance">$7042.60</div>
    </div>
    <div  className="mini-card-profit-section">
      <div  className="mini-card-profit-title">Profit (24h)</div>
      <div  className="mini-card-profit-usd">+$3,237.45</div>
      <div  className="mini-card-profit-percent">+8%</div>
    </div>
    <div  className="mini-card-actions">
      <button  className="btn-mini-card btn-swap">Swap</button>
      <button  className="btn-mini-card btn-buy">Buy</button>
      <button  className="btn-mini-card btn-send">Send</button>
    </div>
  </div>

  <div  className="crypto-mini-card">
    <div  className="mini-card-header">
      <div>
        {/* <div  className="mini-card-icon icon-usdt">$</div> */}
        <div  className="mini-card-title">USDT</div>
      </div>
      <div  className="mini-card-rate">1 USDT = $1.00</div>
    </div>
    <div  className="mini-card-balance-section">
      <div  className="mini-card-crypto-balance">0.000 USDT</div>
      <div  className="mini-card-fiat-balance">$0.00</div>
    </div>
    <div  className="mini-card-profit-section">
      <div  className="mini-card-profit-title">Profit (24h)</div>
      <div  className="mini-card-profit-usd">+$0.00</div>
      <div  className="mini-card-profit-percent">+0.00%</div>
    </div>
    <div  className="mini-card-actions">
      <button  className="btn-mini-card btn-swap">Swap</button>
      <button  className="btn-mini-card btn-buy">Buy</button>
      <button  className="btn-mini-card btn-send">Send</button>
    </div>
  </div>
</div>

<div className="home-history-wrapper-parent">
<div className="home-history-wrapper">
  

  <div className="home-history-header">
    <h2 className="home-history-title">Transactions</h2>
    <span className="home-history-see-all" onClick={handleAddTransaction}>
      See all
    </span>
  </div>

  <div className="home-history-list">
    {history.map((item) => (
      <div key={item.id} className="home-history-item">
        
        <div className="home-history-left">
          <div className="home-history-img">
            {item.icon}
          </div>
          <div className="home-history-info">
            <h4 className="home-history-name">{item.name}</h4>
            <span className="home-history-date">{item.date}</span>
          </div>
        </div>

        <div className="home-history-right">
          <h4 className="home-history-amount">{item.amount}</h4>
          {item.bonus && (
            <span className="home-history-bonus">{item.bonus}</span>
          )}
        </div>
        
      </div>
    ))}
  </div>
  
</div>
</div>



  {/* <div className="fast-func">
    <button className="fast-func-arrow"><span>send</span></button>
   
    <button className="fast-func-arrow-out"><span>get</span></button>
  
  <button className="fast-func-swap"><span>swap</span></button>

    <button className="fast-func-private"><span>block</span></button>
 
  </div>
<div className="active-parent">
    <div className="active">
   
<div className="active-lend">
<div className={"tabs-header " + (activeTab === 0 ? "tab-0-active" : "tab-1-active")}>
<div className="active-tab-indicator">

 
  <div className="curve curve-right" ref={curvRightfRef}></div> 
</div>
 
  <button 
    className={"tab-button " + (activeTab === 0 ? "active" : "")}
    onClick={() => handleTabChange(0)}
  >
  My Assets 
  </button>
  
  <button 
    className={"tab-button " + (activeTab === 1 ? "active" : "")}
    onClick={() => handleTabChange(1)}
  >
    My Transaction
  </button>
</div>
</div>
<div className="card-content" ref={cardRef}>
  {activeTab === 0 ? (
    <div className="fade-in">Assets Content...</div>
  ) : (
    <div className="fade-in">Transactions Content...</div>
  )}
</div>

        </div>
        </div> */}


   {/* <div>
<svg xmlns="http://www.w3.org/2000/svg"  className="icon icon-tabler icon-tabler-arrow-narrow-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="red" d="M0 0h24v24H0z"/>
  <line x1="5" y1="12" x2="19" y2="12" />
  <line x1="5" y1="12" x2="9" y2="16" />
  <line x1="5" y1="12" x2="9" y2="8" />
</svg>
<div className="sidebar">
  <div className="sidebar-background"></div>
  
  <div className="sidebar-content" >
     <div className="Karta-home-div" ref={kartaChildrenRef}>

<button   className="Karta-home-button-1" onClick={HomeGoalPlusBtn1} >
  <h5 className="Karta-home-button-h5">xlavelia</h5> 
  <br />
  <h1 className="Karta-home-button-h1"> <span className="Karta-home-button-balance">$ 117.49</span><span className="Karta-home-button-span"> X </span> </h1>   
<br />

</button>


<button   className="Karta-home-button-2" onClick={HomeGoalPlusBtn2}>
  <h5 className="Karta-home-button-h5">xlavelia</h5> 
  <br />
  <h1 className="Karta-home-button-h1"> <span className="Karta-home-button-balance">$ 7.23</span><span className="Karta-home-button-span"> X </span> </h1>   
<br />

</button>

<button   className="Karta-home-button-3" onClick={HomeGoalPlusBtn3}>
  <h5 className="Karta-home-button-h5">xlavelia</h5> 
  <br />
  <h1 className="Karta-home-button-h1"> <span className="Karta-home-button-balance">$ 0.00</span><span className="Karta-home-button-span"> X </span> </h1>   
<br />

</button>


    </div>
  </div>
</div>

  

<div className="home-activ-goal-parent">
  <div className="home-activ-goal" ref={deleteGoalOld}>
    
    <div className="home-goal-text">
      <h1 className="home-goal-text-h1">Set a new goal</h1>
      <h3 className="home-goal-text-h3">Reach more goals</h3>
    </div>

    <button onClick={HomeGoalPlusBtn} className="home-goal-plus-btn">
      <div className="home-goal-plus-bg"></div>
      <svg className="home-goal-plus-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 20L12 12M12 12L12 4M12 12L20 12M12 12L4 12" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
    </button>


  </div>
</div>


<div className="home-activ-goal-final-parent" ref={finalGoal}>
<div className="home-activ-goal-final" onClick={infoFinalGoalFunc}>
{preview && (
  <img
  className="home-active-goal-photo"
    src={preview}
    alt="preview"
    width="150"
  />
)}
    <div className="home-goal-text-final">
      <h1 className="home-active-goal-name-final">{name}</h1>
      <h3 className="home-active-goal-dollars-final"> <span>{balansPRGoalNow}</span></h3>
 <div className="home-history-text-graf-grandparent-final">
    <div className="home-history-text-graf-parent-final">
        <div className="home-history-text-graf-final"></div>
        
    </div>
</div>

    </div>


</div>
</div>


<div className="home-history-parent"> <div className="home-history-content-div">
<button onClick={() => historyAdd("Netflix", "12.99$")}>
Добавить списание
</button>



    {historyList.map(function(historyItem) {

      return (

        <div className="home-history-content" key={historyItem.id}>
<div className="hauhwgsiws"></div>
          <div className="home-history-text">

            <h1 className="home-history-name">
              {historyItem.name}
            </h1>

            <h3 className="home-history-price">
            <span>   <svg fill="rgb(255, 0, 0)" width="2rem" height="2rem" className="home-out-history-svg" viewBox="-8.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
<title>+</title>
<path d="M0.84 20.040c-0.2 0-0.44-0.080-0.6-0.24-0.32-0.32-0.32-0.84 0-1.2l6.44-6.44c0.32-0.32 0.88-0.32 1.2 0l6.44 6.44c0.32 0.32 0.32 0.84 0 1.2-0.32 0.32-0.84 0.32-1.2 0l-5.84-5.84-5.84 5.84c-0.16 0.16-0.4 0.24-0.6 0.24z"></path>
</svg></span>{historyItem.price}
            </h3>

          </div>

        </div>

      );

    })}

  </div> </div>

<div className="lend-div">
<div className="lend">
<p  className="lend-wallet" onClick={roadHome} >wallet</p>

<svg width="" height="" className="lend-wallet" viewBox="0 0 24 24" fill="transparent" xmlns="http://www.w3.org/2000/svg">
<path d="M20 9.71429V6.28571C20 5.02335 19.1046 4 18 4H4C2.89543 4 2 5.02335 2 6.28571V17.7143C2 18.9767 2.89543 20 4 20H18C19.1046 20 20 18.9767 20 17.7143V14.2857M22 9.71429H16C14.8954 9.71429 14 10.7376 14 12C14 13.2624 14.8954 14.2857 16 14.2857H22V9.71429Z" stroke="" stroke-width="0.1" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<p className="lend-portfolio" onClick={roadCrypto}>crypto</p>


<h1  className="lend-seting">setting</h1>
</div>
</div>
</div>
<div ref={GoalLendParent}  className="goal-lend-parent"><div className="goal-lend-content">
<h1 className="start-goal-lend">Create a new Goal</h1>
  <div className="home-input"> 
<div className="file-wrapper" onClick={openFilePicker}>

  <input
    type="file"
    accept="image/*"
    ref={fileRef} className="photo-input"
    onChange={handleFileChange}
style={{
    position: "absolute",
    opacity: 0,
    width: "1px",
    height: "1px"
  }}

  />

  {image ? (
    <img src={image} alt="preview" />
  ) : (
 <svg className="home-lend-goal-svg" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 20L12 12M12 12L12 4M12 12L20 12M12 12L4 12" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
  )}
</div>
      <div className="home-input-div-parent">
    <div className="name-input-div"> 
      
      <input onChange={inputNameFunc}  className="name-input" type="text" value={name} placeholder="name" /></div> 
 

  <div className="dollar-input-div">
  <input
    type="text"
    value={amount}
    onChange={handleChange}
    inputMode="numeric"
    className="dollar-input"
    placeholder="0.00"
  />

  {amount !== "" && <span className="home-input-dollar-emj">$</span>}
</div>
</div>
  </div>

<div className="dollars">
  <button
  className="dollar"
  onClick={function() { toggleButton(1); }}
  style={{
    backgroundColor: activeButtons.indexOf(1) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(1) !== -1 ? "#ffffff" : "",
 

  }}
>
  1$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(2); }}
  style={{
 backgroundColor: activeButtons.indexOf(2) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(2) !== -1 ? "#ffffff" : "",
 

  }}
>
  3$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(3); }}
  style={{
 backgroundColor: activeButtons.indexOf(3) !== -1 ?" #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(3) !== -1 ? "#ffffff" : "",
 
  }}
>
  5$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(4); }}
  style={{
 backgroundColor: activeButtons.indexOf(4) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(4) !== -1 ? "#ffffff" : "",
 

  }}
>
  20$
</button>
 <div className="line-break"></div>
  <button
  className="dollar"
  onClick={function() { toggleButton(5); }}
  style={{
 backgroundColor: activeButtons.indexOf(5) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(5) !== -1 ? "#ffffff" : "",
 

  }}
>
  50$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(6); }}
  style={{
     backgroundColor: activeButtons.indexOf(6) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(6) !== -1 ? "#ffffff" : " ",
 

  }}
>
  100$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(7); }}
  style={{
    backgroundColor: activeButtons.indexOf(7) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(7) !== -1 ? "#ffffff" : "",
  }}
>
  250$
</button>
  <button
  className="dollar"
  onClick={function() { toggleButton(8); }}
  style={{
 backgroundColor: activeButtons.indexOf(8) !== -1 ? " #203628 " : "  #1b1a1a",
    color: activeButtons.indexOf(8) !== -1 ? "#ffffff" : "",
 

  }}
>
  500$
</button>


<div className="line-break"></div>
   
<button className="dollar-more">more</button>

</div>
<div className="end-goal-lend-parent"><button className="end-goal-lend" onClick={createGoal} ref={createGoalRef}>CREATE</button></div>

  </div>
  </div>

<div  ref={infoFinalGoal} className="info-goal-final-parent"><div className="info-goal-final"><p>RRRRRRwnnnnnnnwheRRRRRRR</p></div></div>
<div  ref={GoalLendParent1} className="karta-lend-parent-1"><div className="karta-lend-content-1"><p>RRRRRR1RRRRRRR</p></div></div>
<div  ref={GoalLendParent2} className="karta-lend-parent-2"><div className="karta-lend-content-2"><p>RRRRRRRRR2RRRR</p></div></div>
<div  ref={GoalLendParent3}  className="karta-lend-parent-3"><div className="karta-lend-content-3"><p>RRR3RRRRRRRRRR</p></div></div>
   */}   </div></div>
  );
}
export default Home;