import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBalance, findProfileById, sendTransfer } from "./useBalance";

const Send = () => {
  const navigate  = useNavigate();
  const trackRef  = useRef(null);

  var balance = useBalance();

  var [amount,       setAmount]       = useState("");
  var [searchQuery,  setSearchQuery]  = useState("");
  var [selectedUser, setSelectedUser] = useState(null);
  var [isSearching,  setIsSearching]  = useState(false);
  var [swipeX,       setSwipeX]       = useState(0);
  var [isDragging,   setIsDragging]   = useState(false);
  var [statusMsg,    setStatusMsg]    = useState(null);
  var [statusOk,     setStatusOk]     = useState(true);

  function roadHome() { navigate("/"); }

  // Numpad
  function handleNumpad(val) {
    if (val === "del") {
      setAmount(amount.slice(0, -1));
    } else if (val === ".") {
      if (!amount.includes(".")) setAmount(amount + ".");
    } else {
      setAmount(amount + val);
    }
  }

  function formatAmount(str) {
    if (!str) return "";
    var parts  = str.split(".");
    parts[0]   = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
  }

  // Search
  var foundUser = null;
  if (searchQuery.length > 0) {
    foundUser = findProfileById(searchQuery.toUpperCase());
  }

  function handleSelect(user) {
    setSelectedUser(user);
    setSearchQuery("");
    setIsSearching(false);
  }

  // Swipe
  function onPointerDown(e) {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!isDragging || !trackRef.current) return;
    var trackRect = trackRef.current.getBoundingClientRect();
    var newX      = e.clientX - trackRect.left - 28;
    var maxX      = trackRect.width - 56;
    if (newX < 0)    newX = 0;
    if (newX > maxX) newX = maxX;
    setSwipeX(newX);
  }
  function onPointerUp(e) {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (!trackRef.current) return;
    var trackRect = trackRef.current.getBoundingClientRect();
    var maxX      = trackRect.width - 56;

    if (swipeX > maxX * 0.8) {
      setSwipeX(maxX);
      var amt = parseFloat(amount);

      if (!selectedUser) {
        setStatusMsg("Select a recipient first");
        setStatusOk(false);
        setSwipeX(0);
        return;
      }
      if (!amt || amt <= 0) {
        setStatusMsg("Enter a valid amount");
        setStatusOk(false);
        setSwipeX(0);
        return;
      }
      if (amt > balance) {
        setStatusMsg("Insufficient balance");
        setStatusOk(false);
        setSwipeX(0);
        return;
      }

      var result = sendTransfer(selectedUser.id, amt);
      if (result.success) {
        setStatusMsg("Sent $" + amt.toFixed(2) + " to " + selectedUser.name);
        setStatusOk(true);
        setTimeout(function () { navigate("/"); }, 1400);
      } else {
        setStatusMsg(result.error);
        setStatusOk(false);
        setSwipeX(0);
      }
    } else {
      setSwipeX(0);
    }
  }

  // Computed display values
  var amountDisplay   = amount ? formatAmount(amount) : "0.00";
  var amountClass     = "fake-input " + (amount ? "has-value" : "is-empty");
  var balanceDisplay  = "Balance: $" + balance.toFixed(2);
  var thumbStyle      = {
    transform:  "translateX(" + swipeX + "px)",
    transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)"
  };
  var textOpacity = trackRef.current
    ? 1 - (swipeX / (trackRef.current.offsetWidth - 56))
    : 1;
  var textStyle     = { opacity: textOpacity };
  var statusClass   = "snd-status " + (statusOk ? "snd-status-ok" : "snd-status-err");
  var showDropdown  = isSearching && searchQuery.length > 0 && foundUser !== null;

  return (
    <div className="SendContent">
      <div className="transfer-page">
        <div className="Road-Home" onClick={roadHome}></div>

        <div className="amount-display-container">
          <span className="currency-symbol">$</span>
          <div className={amountClass}>{amountDisplay}</div>
        </div>
    {statusMsg && (
          <div className={statusClass}>{statusMsg}</div>
        )}
        <div className="snd-balance-chip">{balanceDisplay}</div>

    

        <div className="send-search">
          <div className="search-section">
            <div className="search-bar-wrapper">
              <input
                type="text"
                placeholder="Enter recipient ID..."
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

            {showDropdown && (
              <div className="search-results-dropdown" onClick={() => handleSelect(foundUser)}>
                <div className="mini-avatar">{foundUser.name ? foundUser.name[0].toUpperCase() : "?"}</div>
                <div className="mini-info">
                  <span className="mini-name">{foundUser.name}</span>
                  <span className="mini-id">{"ID: " + foundUser.id}</span>
                </div>
              </div>
            )}

            {isSearching && searchQuery.length > 0 && foundUser === null && (
              <div className="snd-not-found">No user with ID "{searchQuery}" found</div>
            )}
          </div>

          <div className="user-display-area">
            {selectedUser ? (
              <div className="selected-user-card">
                <div className="user-card-main">
                  <div className="user-avatar-large">
                    {selectedUser.name ? selectedUser.name[0].toUpperCase() : "?"}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{selectedUser.name}</span>
                    <span className="user-id-tag">{"UID: " + selectedUser.id}</span>
                  </div>
                </div>
                <button className="change-user-btn" onClick={() => setSelectedUser(null)}>✕</button>
              </div>
            ) : (
              <div className="user-placeholder">Choose recipient to start transfer</div>
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
            <span className="swipe-elite-text" style={textStyle}>
              Swipe to Send
            </span>
            <div
              className="swipe-elite-thumb"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={thumbStyle}
            >
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Send;
