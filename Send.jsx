import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletBalance } from "./useWallet";
import { searchUsers, listContacts, addContact, removeContact, getInitials } from "./contacts";

const Send = () => {
  const navigate = useNavigate();
  const trackRef = useRef(null);

  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var balance = wallet.balance;

  var [step, setStep] = useState("search");
var [query, setQuery] = useState("");
var [results, setResults] = useState([]);
var [isLoadingSearch, setIsLoadingSearch] = useState(false);
var [selectedContact, setSelectedContact] = useState(null);
var [addingId, setAddingId] = useState(null);
var [debugInfo, setDebugInfo] = useState(null);

var searchRequestIdRef = useRef(0);
var searchRequestIdRef = useRef(0);

  var [amount, setAmount] = useState("");
  var [swipeX, setSwipeX] = useState(0);
  var [isDragging, setIsDragging] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);
  var [sent, setSent] = useState(false);

  function roadHome() { navigate("/"); }

var [searchError, setSearchError] = useState(null);
var latestQueryRef = useRef("");

useEffect(function () {
  var requestId = ++searchRequestIdRef.current;
  setIsLoadingSearch(true);

  var delay = query.length === 0 ? 0 : 220;

  var handle = setTimeout(function () {
    var searchPromise = query.length === 0
      ? listContacts().then(function (res) { return { results: res, debug: null }; })
      : searchUsers(query);

    searchPromise.then(function (outcome) {
      if (searchRequestIdRef.current !== requestId) return;
      setResults(outcome.results);
      setIsLoadingSearch(false);
    });
  }, delay);

  return function () { clearTimeout(handle); };
}, [query]);


  function handleSelectContact(contact) {
    setSelectedContact(contact);
  }
  function handleClearSelection() {
    setSelectedContact(null);
  }
  function handleGoToAmount() {
    if (!selectedContact) return;
    setStatusMsg(null);
    setStep("amount");
  }
  function handleBackToSearch() {
    setStatusMsg(null);
    setSwipeX(0);
    setStep("search");
  }

function handleToggleContact(e, contact) {
  e.stopPropagation();
  if (addingId === contact.id) return;
  setAddingId(contact.id);

  var action = contact.isContact ? removeContact(contact.id) : addContact(contact.id);

  action.then(function () {
    setResults(function (prev) {
      return prev.map(function (r) {
        return r.id === contact.id ? Object.assign({}, r, { isContact: !contact.isContact }) : r;
      });
    });
    setAddingId(null);
  }).catch(function () {
    setAddingId(null);
  });
}

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
    var parts = str.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
  }

  function onPointerDown(e) {
    if (sent) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!isDragging || !trackRef.current) return;
    var trackRect = trackRef.current.getBoundingClientRect();
    var newX = e.clientX - trackRect.left - 30;
    var maxX = trackRect.width - 70;
    if (newX < 0) newX = 0;
    if (newX > maxX) newX = maxX;
    setSwipeX(newX);
  }
  async function onPointerUp(e) {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (!trackRef.current) return;
    var trackRect = trackRef.current.getBoundingClientRect();
    var maxX = trackRect.width - 60;

    if (swipeX > maxX * 0.8) {
      setSwipeX(maxX);
      var amt = parseFloat(amount);

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

      try {
        var result = await authFetchSend(selectedContact.id, amt);
        setStatusMsg("Sent $" + amt.toFixed(2) + " to " + selectedContact.name);
        setStatusOk(true);
        setSent(true);
        refreshWallet();
        setTimeout(function () {
          navigate("/sendcheck", { state: { transferId: result.id } });
        }, 900);
      } catch (err) {
        setStatusMsg(err.message);
        setStatusOk(false);
        setSwipeX(0);
      }
    } else {
      setSwipeX(0);
    }
  }

  async function authFetchSend(recipientPlayerId, amt) {
    var { authFetch } = await import("./apiClient");
    return authFetch("/transfers/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientPlayerId: recipientPlayerId, amount: amt })
    });
  }

  var amountDisplay = amount ? formatAmount(amount) : "0.00";
  var amountClass = "snd-fake-input " + (amount ? "has-value" : "is-empty");
  var balanceDisplay = "Balance $" + balance.toFixed(2);

  var thumbStyle = {
    transform: "translateX(" + swipeX + "px)",
    transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)"
  };
  var textOpacity = trackRef.current
    ? 1 - (swipeX / (trackRef.current.offsetWidth - 56))
    : 1;
  var textStyle = { opacity: textOpacity };
  var statusClass = "snd-status " + (statusOk ? "snd-status-ok" : "snd-status-err");

  var flowClass = "snd-flow " + (step === "amount" ? "at-amount" : "at-search");
  var nextBtnClass = "snd-next-btn " + (selectedContact ? "active" : "disabled");

  var showEmpty = !isLoadingSearch && results.length === 0;
  var resultsLabel = query.length === 0 ? "Contacts" : "Results";

  var recipientInitials = selectedContact ? getInitials(selectedContact.name) : "";
  var swipeThumbClass = sent ? "snd-swipe-thumb sent" : "snd-swipe-thumb";

  return (
    <div className="SendContent">
      <div className={flowClass}>

        <div className="snd-step snd-step-search">

          <div className="snd-search-header">
            <span className="snd-eyebrow">Step 1 of 2</span>
            <h1 className="snd-title">Send USDT</h1>
          </div>

          {selectedContact && (
            <div className="snd-selected-chip">
              <div className="snd-chip-avatar" style={{ backgroundColor: selectedContact.color }}>
                {recipientInitials}
              </div>
              <div className="snd-chip-info">
                <span className="snd-chip-name">{selectedContact.name}</span>
                <span className="snd-chip-id">{selectedContact.id}</span>
              </div>
              <button className="snd-chip-clear" onClick={handleClearSelection}>✕</button>
            </div>
          )}

          <div className="snd-search-bar">
            <svg className="snd-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="snd-search-input"
              placeholder="Search by name or ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isLoadingSearch && <div className="snd-search-spinner"></div>}
          </div>

          <div className="snd-results-label">{resultsLabel}</div>

          <div className="snd-results-list">
            {results.map(function (contact, idx) {
              var isSelected = selectedContact && selectedContact.id === contact.id;
              var cardClass = "snd-contact-card " + (isSelected ? "selected" : "");
              var delayStyle = { animationDelay: (idx * 0.04) + "s" };
              var isAddingThis = addingId === contact.id;
              return (
                <div key={contact.id} className={cardClass} style={delayStyle} onClick={() => handleSelectContact(contact)}>
                  <div className="snd-contact-avatar" style={{ backgroundColor: contact.color }}>
                    {getInitials(contact.name)}
                  </div>
                  <div className="snd-contact-info">
                    <span className="snd-contact-name">{contact.name}</span>
                    <span className="snd-contact-id">{contact.id}</span>
                  </div>
                 <button
  className={"snd-add-contact-btn " + (contact.isContact ? "added" : "")}
  onClick={(e) => handleToggleContact(e, contact)}
  disabled={isAddingThis}
>
                    {contact.isContact ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 12.5 9.5 18 20 6"></polyline>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="7" r="3.5"></circle>
                        <path d="M3 19c0-3.3 2.7-5.5 6-5.5"></path>
                        <line x1="17" y1="8" x2="17" y2="14"></line>
                        <line x1="14" y1="11" x2="20" y2="11"></line>
                      </svg>
                    )}
                  </button>
                  {isSelected && <div className="snd-contact-check"></div>}
                </div>
              );
            })}
{searchError && (
  <div className="snd-empty snd-empty-error">
    <span className="snd-empty-text">Search failed</span>
    <span className="snd-empty-hint">{searchError}</span>
  </div>
)}

{!searchError && !isLoadingSearch && results.length === 0 && (
  <div className="snd-empty">
    <span className="snd-empty-text">
      {query.length === 0 ? "No contacts yet" : ("No matches for \u201C" + query + "\u201D")}
    </span>
    <span className="snd-empty-hint">
      {query.length === 0 ? "Search by name or ID to find someone" : "Try a different name or ID"}
    </span>
  </div>
)}
          </div>

          <div className="snd-step-footer">
            <button className={nextBtnClass} disabled={!selectedContact} onClick={handleGoToAmount}>
              Next
            </button>
          </div>
        </div>

        <div className="snd-step snd-step-amount">

          <div className="snd-amount-header">
            <button className="snd-back-btn" onClick={handleBackToSearch}>‹</button>
            {selectedContact && (
              <div className="snd-recipient-pill">
                <div className="snd-pill-avatar" style={{ backgroundColor: selectedContact.color }}>
                  {recipientInitials}
                </div>
                <span className="snd-pill-name">{selectedContact.name}</span>
                <span className="snd-pill-id">{selectedContact.id}</span>
              </div>
            )}
          </div>

          <div className="snd-amount-display-container">
            <span className="snd-currency-symbol">$</span>
            <div className={amountClass}>{amountDisplay}</div>
          </div>

          {statusMsg && (
            <div className={statusClass}>{statusMsg}</div>
          )}

          <div className="snd-balance-chip">{balanceDisplay}</div>

          <div className="snd-numpad-grid-parent">
            <div className="snd-numpad-grid">
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

          <div className="snd-swipe-container">
            <div className="snd-swipe-track" ref={trackRef}>
              <span className="snd-swipe-text" style={textStyle}>
                Swipe to Send
              </span>
              <div
                className={swipeThumbClass}
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
    </div>
  );
};

export default Send;