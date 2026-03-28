import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Send = () => {
 const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };

    const [amount, setAmount] = useState("");

  const handleNumpad = (val) => {
    if (val === "del") {
      setAmount(amount.slice(0, -1));
    } else if (val === ".") {
      if (!amount.includes(".")) setAmount(amount + ".");
    } else {
      setAmount(amount + val);
    }
  };

  // Форматирование: 1234567 -> 1 234 567
  const formatAmount = (str) => {
    if (!str) return "";
    const parts = str.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
  };

  
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
    let newX = e.clientX - trackRect.left - 28;
    const maxX = trackRect.width - 56;

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
const mockUsers = [
  { id: "7721", name: "Alex Rover", avatar: "AR" },
  { id: "0042", name: "Tim Shim", avatar: "TS" },
  { id: "1337", name: "Elite Dev", avatar: "ED" }
];


  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Логика поиска
  const foundUser = mockUsers.find(u => u.id === searchQuery);

  const handleSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery("");
    setIsSearching(false);
  };

  return (<div className="SendContent">

   <div className="transfer-page">
      
<div className="Road-Home" onClick={roadHome}></div>
      

      <div className="amount-display-container">
        <span className="currency-symbol">$</span>
        <div className={"fake-input " + (amount ? "has-value" : "is-empty")}>
          {amount ? formatAmount(amount) : "0.00"}
        </div>
      </div>
   <div className="send-search">
      <div className="search-section">
        {/* <button className="icon-btn-send" onClick={roadHome}>↑</button> */}
        <div className="search-bar-wrapper">
          <input 
            type="text" 
            placeholder="Search by ID or Scan..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearching(true)}
          />
          <div className="search-actions">
            <button className="search-icon-btn">QR</button>
            <button className="search-icon-btn">#</button>
          </div>
        </div>

        {/* Выпадающий список при поиске */}
        {isSearching && searchQuery && foundUser && (
          <div className="search-results-dropdown" onClick={() => handleSelect(foundUser)}>
            <div className="mini-avatar">{foundUser.avatar}</div>
            <div className="mini-info">
              <span className="mini-name">{foundUser.name}</span>
              <span className="mini-id">ID: {foundUser.id}</span>
            </div>
           
          </div>
        )}
      </div>

      {/* Блок выбранного пользователя (аккуратный "элитный" блок) */}
      <div className="user-display-area">
        {selectedUser ? (
          <div className="selected-user-card">
            <div className="user-card-main">
              <div className="user-avatar-large">{selectedUser.avatar}</div>
              <div className="user-details">
                <span className="user-name">{selectedUser.name}</span>
                <span className="user-id-tag">UID: {selectedUser.id}</span>
              </div>
            </div>
            <button className="change-user-btn" onClick={() => setSelectedUser(null)}>x</button>
          </div>
        ) : (
          <div className="user-placeholder">
            Choose recipient to start transfer
          </div>
        )}
      </div>

   </div>
<div className="numpad-grid-parent">
      <div className="numpad-grid">
        <button onClick={() => handleNumpad("1")}>1</button>
        <button onClick={() => handleNumpad("2")}>2</button>
        <button onClick={() => handleNumpad("3")}>3</button>
        <button onClick={() => handleNumpad("4")}>4</button>
        <button onClick={() => handleNumpad("5")}>5</button>
        <button onClick={() => handleNumpad("6")}>6</button>
        <button onClick={() => handleNumpad("7")}>7</button>
        <button onClick={() => handleNumpad("8")}>8</button>
        <button onClick={() => handleNumpad("9")}>9</button>
        <button onClick={() => handleNumpad(".")}>.</button>
        <button onClick={() => handleNumpad("0")}>0</button>
        <button onClick={() => handleNumpad("del")}>/</button>
      </div>
      </div>
 <div className="swipe-elite-container">
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

export default Send;