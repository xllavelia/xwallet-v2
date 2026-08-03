import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWalletBalance } from "./useWallet";
import { useCard, executeTrade } from "./useCard";

var COINS = ["BTC", "ETH", "SOL", "TON"];

const TradeCoin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  var prefillDirection = (location.state && location.state.direction) || "buy";

  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var { card, refresh: refreshCard } = useCard();

  var [direction, setDirection] = useState(prefillDirection);
  var [coin, setCoin] = useState("BTC");
  var [amount, setAmount] = useState("");
  var [livePrice, setLivePrice] = useState(0);
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);

  useEffect(function () {
    var active = true;
    function fetchPrice() {
      fetch("https://api.binance.com/api/v3/ticker/price?symbol=" + coin + "USDT")
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!active) return;
          setLivePrice(parseFloat(d.price) || 0);
        })
        .catch(function () {});
    }
    fetchPrice();
    var iv = setInterval(fetchPrice, 8000);
    return function () { active = false; clearInterval(iv); };
  }, [coin]);

  function roadHome() { navigate(-1); }

  var usdAmount = parseFloat(amount) || 0;
  var coinAmount = livePrice > 0 ? usdAmount / livePrice : 0;

  var assetMatch = card.assets.find(function (a) { return a.id === coin; });
  var coinHeldAmount = assetMatch ? assetMatch.amount : 0;

  var maxUsdForSell = coinHeldAmount * livePrice;
  var isBuy = direction === "buy";
  var insufficient = isBuy ? usdAmount > wallet.balance : usdAmount > maxUsdForSell;

  var pillClass = "crd-toggle-pill " + direction;
  var btnClass = "crd-submit-btn " + (isBuy ? "buy" : "sell");

  async function handleSubmit() {
    if (usdAmount <= 0 || insufficient || isSubmitting) return;
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      await executeTrade(coin, usdAmount, direction);
      setStatusMsg((isBuy ? "Bought " : "Sold ") + coinAmount.toFixed(6) + " " + coin);
      setStatusOk(true);
      setAmount("");
      refreshWallet();
      refreshCard();
    } catch (err) {
      setStatusMsg(err.message);
      setStatusOk(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="TradeCoinContent">
      <div className="Road-Home" onClick={roadHome}></div>

      <div className="crd-page">

        <div className="crd-header">
          <span className="crd-eyebrow">Card</span>
          <h1 className="crd-title">{isBuy ? "Buy Crypto" : "Sell Crypto"}</h1>
        </div>

        <div className="crd-toggle">
          <div className={pillClass}></div>
          <button className={"crd-toggle-btn " + (isBuy ? "active" : "")} onClick={() => setDirection("buy")}>Buy</button>
          <button className={"crd-toggle-btn " + (!isBuy ? "active" : "")} onClick={() => setDirection("sell")}>Sell</button>
        </div>

        <div className="crd-coin-row">
          {COINS.map(function (c) {
            return (
              <button key={c} className={"crd-coin-chip " + (coin === c ? "active" : "")} onClick={() => setCoin(c)}>
                {c}
              </button>
            );
          })}
        </div>

        {/* <div className="crd-balance-line">
          {isBuy
            ? "Available: $" + wallet.balance.toFixed(2)
            : "Available: " + coinHeldAmount.toFixed(6) + " " + coin}
        </div> */}
<div className="crd-input-wrap-div">
        <div className="crd-input-wrap">
          <span className="crd-input-currency">$</span>
          <input
            type="number"
            className="crd-input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div> </div>

        {/* <div className="crd-preview-line">
          {livePrice > 0
            ? "≈ " + coinAmount.toFixed(6) + " " + coin + " @ $" + livePrice.toLocaleString("en-US")
            : "Loading price..."}
        </div> */}

        <div className="crd-presets">
          {[10, 50, 100, 250].map(function (val) {
            return (
              <button key={val} className="crd-preset-btn" onClick={() => setAmount(val.toString())}>{"$" + val}</button>
            );
          })}
        </div>

        {insufficient && usdAmount > 0 && (
          <div className="crd-alert">Insufficient {isBuy ? "balance" : coin}</div>
        )}

        {statusMsg && (
          <div className={"crd-status " + (statusOk ? "ok" : "err")}>{statusMsg}</div>
        )}

        <button className={btnClass} disabled={usdAmount <= 0 || insufficient || isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "Processing..." : (isBuy ? "Buy " + coin : "Sell " + coin)}
        </button>

      </div>
    </div>
    
  );
};

export default TradeCoin;