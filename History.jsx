import { color } from "framer-motion";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";


const History = () => {
 const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };
 const [activeTab, setActiveTab] = useState('transactions');

const transactionsDB = [
  {
    id: 1,
    name: "Get USDT",
    network: "mainiet",
    date: "October 17, 09:00 PM",
    amount: "44.80",
    bonus: "44.80$",
     icon: "↓"
  },
  {
    id: 2,
     name: "Get BTC",
    network: "btc",
    date: "October 15, 08:15 AM",
    amount: "0.07",
    bonus: "560$",
    icon: "↓"  
},
  {
    id: 3,
   name: "Send ETH",
    network: "erc20",
    date: "October 16, 12:30 PM",
    amount: "-0.85",
    bonus: "3450$",
    icon: "↑ "
  },

 {
    id: 4,
   name: "Send SOL",
    network: "solana",
    date: "October 17, 02:30 PM",
    amount: "-7.00",
    bonus: "689$",
        icon: "↑ "
  }
];


const activeTrade = [
  {
    id: 1,
    name: "BTC",
    date: "LONG",
    color: "hsl(162, 90%, 20%)",
    amount: "-4.80$",
    bonus: "-1.65%",
     bgcolor:"#ff5e62",
     icon: ""
     },
  {
    id: 2,
     name: "ETH",
    date: "LONG",
    color: "hsl(162, 90%, 20%)",
    amount: "+5.90$",
     bgcolor:"#26a17b",
    bonus: "+250%",
    icon: ""
  },
  {
    id: 3,
   name: "SOL",
    date: "SHORT",
    color: "hsl(70, 80%, 80%)",
     bgcolor:"#ff5e62",
    amount: "-27.87$",
    bonus: "-1.9%",
    icon: ""
  },

 {
    id: 4,
   name: "TON",
    date: "SHORT",
    color: "hsl(70, 80%, 80%)",
    bgcolor:"#26a17b",
    amount: "+10.00",
    bonus: "+37%",
        icon:""
  }
];


const completedTrade = [
  {
    id: 1,
    name: "BTC",
     date: "October 15, 12:30 PM",
    stat: "LONG",
    color: "hsl(162, 90%, 20%)",
    amount: "-80$",
    bonus: "-65%",
     bgcolor:"#ff5e62",
     icon: ""
     },
  {
    id: 2,
     name: "ETH",
    date: "October 16, 00:30 PM",
    stat: "LONG",
    color: "hsl(162, 90%, 20%)",
    amount: "+0.90$",
     bgcolor:"#26a17b",
    bonus: "+25%",
    icon: ""
  },
  {
    id: 3,
   name: "SOL",
      date: "October 17, 18:10 PM",
    stat: "LONG",
    color: "hsl(70, 80%, 80%)",
     bgcolor:"#ff5e62",
    amount: "-87$",
    bonus: "-17%",
    icon: ""
  },

 {
    id: 4,
   name: "TON",
     date: "October 17, 19:25 PM",
    stat: "LONG",
    color: "hsl(70, 80%, 80%)",
    bgcolor:"#26a17b",
    amount: "+98.32",
    bonus: "+76%",
        icon:""
  }
];




const swap = [
  {
    id: 1,
    name: "Bitcoin",
    nameSwap: "usdt",
    color: "hsl(162, 90%, 20%)",
    amount: "+0.003",
    bonus: "-650",
     bgcolor:"#ff5e62",
     icon: "⇄"
     },
  {
    id: 2,
     name: "Ethureum",
   nameSwap: "solana",
    color: "hsl(162, 90%, 20%)",
    amount: "+0.90",
     bgcolor:"#26a17b",
    bonus: "-25",
    icon: "⇄"
  },  
  {
    id: 3,
   name: "Usdt",
   nameSwap: "Ton",
    color: "hsl(70, 80%, 80%)",
     bgcolor:"#ff5e62",
    amount: "+700",
    bonus: "-2.3",
    icon: "⇄"
  },

 {
    id: 4,
   name: "Solana",
   nameSwap: "btc",
    stat: "LONG",
    color: "hsl(70, 80%, 80%)",
    bgcolor:"#26a17b",
    amount: "+8.32",
    bonus: "-0.076",
        icon:"⇄"
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



// 2. Стейт, в котором изначально лежит только первая транзакция
const [historySwap, setHistorySwap] = useState([swap[0]]);
const [clickCountSwap, setClickCountSwap] = useState(1);

// 3. Функция добавления новой карточки при клике
const handleAddSwap = () => {
  if (clickCountSwap < swap.length) {
    setHistorySwap([ swap[clickCountSwap], ...historySwap]);
    setClickCountSwap(clickCountSwap + 1);
  }
};  



// 2. Стейт, в котором изначально лежит только первая транзакция
const [historyActive, setHistoryActive] = useState([activeTrade[0]]);
const [clickCountActive, setClickCountActive] = useState(1);

// 3. Функция добавления новой карточки при клике
const handleAddActive = () => {
  if (clickCountActive< activeTrade.length) {
    setHistoryActive([ activeTrade[clickCountActive], ...historyActive]);
    setClickCountActive(clickCountActive + 1);
  }
};


// 2. Стейт, в котором изначально лежит только первая транзакция
const [historyCompleted, setHistoryCompleted] = useState([completedTrade[0]]);
const [clickCountCompleted, setClickCountCompleted] = useState(1);

// 3. Функция добавления новой карточки при клике
const handleAddCompleted = () => {
  if (clickCountCompleted < completedTrade.length) {
    setHistoryCompleted([ completedTrade[clickCountCompleted], ...historyCompleted]);
    setClickCountCompleted(clickCountCompleted + 1);
  }
};  

  return (<div className="HistoryContent">
<div className="Road-Home" onClick={roadHome}></div>
 <div className="history-screen">
      <div className="history-header">
        <h1>History</h1>
      </div>

      {/* Навигация по вкладкам */}
      <div className="history-tabs">
        <button 
          className={'history-tab ' + (activeTab === 'transactions' ? 'active-tab' : '')} 
          onClick={() => setActiveTab('transactions')}
        >
         <span onClick={handleAddTransaction} style={{
    fontFamily: "Unbounded"
  }} >Transactions </span> 
        </button>

         <button 
          className={'history-tab ' + (activeTab === 'swap' ? 'active-tab' : '')} 
          onClick={() => setActiveTab('swap')}
        >
          <span style={{
    fontFamily: "Unbounded"
  }} onClick={handleAddSwap}>Swap</span>
        </button>

        <button 
          className={'history-tab ' + (activeTab === 'active' ? 'active-tab' : '')} 
          onClick={() => setActiveTab('active')}
        >
          <span style={{
    fontFamily: "Unbounded"
  }} onClick={handleAddActive}>Active Trades</span>
        </button>
        <button 
          className={'history-tab ' + (activeTab === 'completed' ? 'active-tab' : '')} 
          onClick={() => setActiveTab('completed')}
        >
        <span style={{fontFamily: "Unbounded"}} onClick={handleAddCompleted}> Completed Trades</span> 
        </button>
      </div>

   
      {/* Контент в зависимости от выбранной вкладки */}
      <div className="history-content">
        
        {/* Вкладка: Транзакции */}
        {activeTab === 'transactions' && (
        
<div className="home-history-wrapper-parent">
<div className="home-history-wrapper">
  
  <div className="home-history-list">
    {history.map((item) => (
      <div key={item.id} className="home-history-item">
        
        <div className="home-history-left">
          <div className="home-history-img">
            {item.icon}
          </div>
          <div className="home-history-info">
            <h4 className="home-history-name">{item.name}  <span style={{color: " rgba(255, 255, 255, 0.4)", fontSize: "0.8rem"}}>{item.network}</span></h4>
            <span className="home-history-date" >{item.date}</span>
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
        )} 

        
           
        {/* Вкладка: Транзакции */}
        {activeTab === 'transactions' && (
        
<div className="home-history-wrapper-parent">
<div className="home-history-wrapper">
  
  <div className="home-history-list">
    {history.map((item) => (
      <div key={item.id} className="home-history-item">
        
        <div className="home-history-left">
          <div className="home-history-img">
            {item.icon}
          </div>
          <div className="home-history-info">
            <h4 className="home-history-name">{item.name}  <span style={{color: " rgba(255, 255, 255, 0.4)", fontSize: "0.8rem"}}>{item.network}</span></h4>
            <span className="home-history-date" >{item.date}</span>
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
        )}









          {activeTab === 'swap' && (
        
<div className="home-history-wrapper-parent">
<div className="home-history-wrapper">
  
  <div className="home-history-list">
    {swap.map((item) => (
      <div key={item.id} className="home-history-item">
        
        <div className="home-history-left">
          <div className="home-history-img">
            {item.icon}
          </div>
          <div className="home-history-info">
            <h4 className="home-history-name">{item.name}  <span style={{color: " rgba(255, 255, 255, 0.4)", fontSize: "0.8rem"}}></span></h4>
            <span className="home-history-date">{item.nameSwap}</span>
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
        )}
 {activeTab === 'swap' && (
        
<div className="home-history-wrapper-parent">
<div className="home-history-wrapper">
  
  <div className="home-history-list">
    {swap.map((item) => (
      <div key={item.id} className="home-history-item">
        
        <div className="home-history-left">
          <div className="home-history-img">
            {item.icon}
          </div>
          <div className="home-history-info">
            <h4 className="home-history-name">{item.name}  <span style={{color: " rgba(255, 255, 255, 0.4)", fontSize: "0.8rem"}}></span></h4>
            <span className="home-history-date">{item.nameSwap}</span>
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
        )}







        {/* Вкладка: Активные трейды */}
        {activeTab === 'active' && (
           
<div className="home-history-wrapper-parent">
<div className="home-history-wrapper">
  
  <div className="home-history-list">
    {historyActive.map((item) => (
      <div key={item.id} className="home-history-item">
        
        <div className="home-history-left">
         
          <div className="home-history-info">
            <h4 className="home-history-name-active">{item.name}</h4>
            <span className="home-history-date-active "style={{color: item.color}}>{item.date}</span>
          </div>
        </div>

        <div className="home-history-right">
          <h4 className="home-history-amount-active">{item.amount}</h4>
          {item.bonus && (
            <span className="home-history-bonus-active" style={{backgroundColor: item.bgcolor}}>{item.bonus}</span>
          )}
        </div>
        
      </div>
    ))}
    
  </div>
        </div>
        </div>
        )}
        {/* Вкладка: Активные трейды */}
        {activeTab === 'active' && (
           
<div className="home-history-wrapper-parent">
<div className="home-history-wrapper">
  
  <div className="home-history-list">
    {historyActive.map((item) => (
      <div key={item.id} className="home-history-item">
        
        <div className="home-history-left">
         
          <div className="home-history-info">
            <h4 className="home-history-name-active">{item.name}</h4>
            <span className="home-history-date-active "style={{color: item.color}}>{item.date}</span>
          </div>
        </div>

        <div className="home-history-right">
          <h4 className="home-history-amount-active">{item.amount}</h4>
          {item.bonus && (
            <span className="home-history-bonus-active" style={{backgroundColor: item.bgcolor}}>{item.bonus}</span>
          )}
        </div>
        
      </div>
    ))}
    
  </div>
        </div>
        </div>
        )}








        {/* Вкладка: Завершенные трейды */}
        {activeTab === 'completed' && (
                  
<div className="home-history-wrapper-parent">
<div className="home-history-wrapper">
  
  <div className="home-history-list">
    {historyCompleted.map((item) => (
      <div key={item.id} className="home-history-item">
        
        <div className="home-history-left">
         
          <div className="home-history-info">
            <h4 className="home-history-name-active">{item.name} <span style={{color: " hsl(61, 80%, 78%)"}}>completed</span></h4>
            <span className="home-history-date-active " >{item.stat} <span style={{color: " rgba(255, 255, 255, 0.4)"}}>{item.date}</span></span>
          </div>
        </div>

        <div className="home-history-right">
          <h4 className="home-history-amount-active">{item.amount}</h4>
          {item.bonus && (
            <span className="home-history-bonus-active" style={{backgroundColor: item.bgcolor}}>{item.bonus}</span>
          )}
        </div>
        
      </div>
    ))}
    
  </div>
        </div>
        </div>
        )}
           {/* Вкладка: Завершенные трейды */}
        {activeTab === 'completed' && (
                  
<div className="home-history-wrapper-parent">
<div className="home-history-wrapper">
  
  <div className="home-history-list">
    {historyCompleted.map((item) => (
      <div key={item.id} className="home-history-item">
        
        <div className="home-history-left">
         
          <div className="home-history-info">
            <h4 className="home-history-name-active">{item.name} <span style={{color: " hsl(61, 80%, 78%)"}}>completed</span></h4>
            <span className="home-history-date-active " >{item.stat} <span style={{color: " rgba(255, 255, 255, 0.4)"}}>{item.date}</span></span>
          </div>
        </div>

        <div className="home-history-right">
          <h4 className="home-history-amount-active">{item.amount}</h4>
          {item.bonus && (
            <span className="home-history-bonus-active" style={{backgroundColor: item.bgcolor}}>{item.bonus}</span>
          )}
        </div>
        
      </div>
    ))}
    
  </div>
        </div>
        </div>
        )}



      </div>
    </div>

</div>);
};

export default History;