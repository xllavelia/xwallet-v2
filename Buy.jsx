import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";


const Buy = () => {
 const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };

   const [amount, setAmount] = useState("");
  const [crypto, setCrypto] = useState("BTC"); // BTC, ETH, SOL
  const [isBuying, setIsBuying] = useState(true); // USD -> Crypto или наоборот

  // Актуальные курсы (условные на 2026 год)
  const btcRate = 95000;
  const ethRate = 4200;
  const solRate = 210;

  // Определение текущего курса
  let currentRate = btcRate;
  if (crypto === "ETH") currentRate = ethRate;
  if (crypto === "SOL") currentRate = solRate;

  const handlePress = (val) => {
    if (val === "del") {
      setAmount(amount.slice(0, -1));
    } else if (val === ".") {
      if (!amount.includes(".")) setAmount(amount + ".");
    } else {
      setAmount(amount + val);
    }
  };

  const toggleCrypto = () => {
    if (crypto === "BTC") setCrypto("ETH");
    else if (crypto === "ETH") setCrypto("SOL");
    else setCrypto("BTC");
  };

  // Расчет результата
  const num = Number(amount) || 0;
  const result = isBuying 
    ? (num / currentRate).toFixed(6) 
    : (num * currentRate).toFixed(2);


 
 const [swipeX, setSwipeX] = useState(0);
   const [isDragging, setIsDragging] = useState(false);
   const trackRef = useRef(null);
 
   // 2. Логика свайпа через Pointer Events
   const onPointerDown = (e) => {
     setIsDragging(true);
     // Захватываем курсор/палец, чтобы свайп не обрывался при выходе за пределы кнопки
     e.currentTarget.setPointerCapture(e.pointerId);
   };
 
   const onPointerMove = (e) => {
     if (!isDragging || !trackRef.current) return;
     
     const trackRect = trackRef.current.getBoundingClientRect();
     // 28 - это ровно половина ширины нашего кружка (56px), чтобы он был по центру пальца
     let newX = e.clientX - trackRect.left - 30;
     const maxX = trackRect.width - 60;
 
     // Жесткие рамки: от 0 до конца трека
     if (newX < 0) newX = 0;
     if (newX > maxX) newX = maxX;
 
     setSwipeX(newX);
   };
 
   const onPointerUp = (e) => {
     if (!isDragging) return;
     setIsDragging(false);
     e.currentTarget.releasePointerCapture(e.pointerId);
 
     const trackRect = trackRef.current.getBoundingClientRect();
     const maxX = trackRect.width - 56;
 
     // Если дотянули больше чем на 80% — успех
     if (swipeX > maxX * 0.8) {
       setSwipeX(maxX); // Доводим до конца
       setTimeout(() => {
         if (roadHome) roadHome(); // Вызываем закрытие/перевод с задержкой для красоты
       }, 300);
     } else {
       setSwipeX(0); // Иначе отпружинивает обратно
     }
   }; 

  return (<div className="BuyContent">

    <div className="ex-container">
      

      <div className="ex-main-content">
        {/* ВЕРХНЯЯ КАРТОЧКА */}
        <div className="ex-card">
          <div className="ex-card-row">
            <div className="ex-asset-info" onClick={!isBuying ? toggleCrypto : undefined}>
              <div className="ex-icon-circle">{isBuying ? "$" : crypto}</div>
              <span className="ex-asset-name">{isBuying ? "USD" : crypto}</span>
            </div>
            <div className="ex-val-box">
              <span className="ex-val-text">{amount || "0"}</span>
            </div>
          </div>
          <div className="ex-card-footer">
            <span className="ex-hint">You send</span>
            <span className="ex-sub-rate">1 {isBuying ? "USD" : crypto} = {isBuying ? (1/currentRate).toFixed(8) : currentRate} {isBuying ? crypto : "USD"}</span>
          </div>
        </div>

        {/* ПЕРЕКЛЮЧАТЕЛЬ */}
        <div className="ex-divider">
          <button className="ex-swap-btn" onClick={() => setIsBuying(!isBuying)}>⇅</button>
        </div>

        {/* НИЖНЯЯ КАРТОЧКА */}
        <div className="ex-card">
          <div className="ex-card-row">
            <div className="ex-asset-info" onClick={isBuying ? toggleCrypto : undefined}>
              <div className="ex-icon-circle">{isBuying ? crypto : "$"}</div>
              <span className="ex-asset-name">{isBuying ? crypto : "USD"}</span>
            </div>
            <div className="ex-val-box">
              <span className="ex-val-text ex-dim">{result}</span>
            </div>
          </div>
          <div className="ex-card-footer">
            <span className="ex-hint">You get</span>
            <span className="ex-sub-rate">1 {isBuying ? crypto : "USD"} = {isBuying ? currentRate : (1/currentRate).toFixed(8)} {isBuying ? "USD" : crypto}</span>
          </div>
        </div>
      </div>

      {/* УМЕНЬШЕННЫЙ НУМПАД */}
      <div className="numpad-grid">
        <button onClick={() => handlePress("1")}>1</button>
        <button onClick={() => handlePress("2")}>2</button>
        <button onClick={() => handlePress("3")}>3</button>
        <button onClick={() => handlePress("4")}>4</button>
        <button onClick={() => handlePress("5")}>5</button>
        <button onClick={() => handlePress("6")}>6</button>
        <button onClick={() => handlePress("7")}>7</button>
        <button onClick={() => handlePress("8")}>8</button>
        <button onClick={() => handlePress("9")}>9</button>
        <button onClick={() => handlePress(".")}>.</button>
        <button onClick={() => handlePress("0")}>0</button>
        <button onClick={() => handlePress("del")}>/</button>
      </div>


       <div className="swipe-elite-container ">
      <div className="swipe-elite-track" ref={trackRef}>
        
        {/* Вычисляем прозрачность текста в зависимости от того, как далеко ушел свайп */}
        <span 
          className="swipe-elite-text" 
          style={{ opacity: trackRef.current ? 1 - (swipeX / (trackRef.current.offsetWidth - 56)) : 1 }}
        >
          Swipe to Send
        </span>
        
        {/* Сам ползунок */}
        <div 
          className="swipe-elite-thumb"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ 
            transform: "translateX(" + swipeX + "px)",
            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}
        >
          
        </div>

      </div>
    </div>
    </div>
   


</div>);
};

export default Buy;