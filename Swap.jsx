import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletBalance } from "./useWallet";
import { useCard, executeSwap } from "./useCard";

var ASSETS = [
  { id: "USDT", label: "USDT" },
  { id: "BTC", label: "Bitcoin" },
  { id: "ETH", label: "Ethereum" },
  { id: "SOL", label: "Solana" },
  { id: "TON", label: "Toncoin" }
];

function SwapArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="7 10 12 5 17 10"></polyline>
      <line x1="12" y1="5" x2="12" y2="15"></line>
      <polyline points="7 14 12 19 17 14"></polyline>
      <line x1="12" y1="19" x2="12" y2="9"></line>
    </svg>
  );
}

const Swap = () => {
  const navigate = useNavigate();

  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var { card, refresh: refreshCard } = useCard();

  var [fromAsset, setFromAsset] = useState("USDT");
  var [toAsset, setToAsset] = useState("BTC");
  var [fromAmount, setFromAmount] = useState("");
  var [prices, setPrices] = useState({});
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);
  var [pickerOpenFor, setPickerOpenFor] = useState(null);

  useEffect(function () {
    var active = true;
    function fetchPrices() {
      var coins = ["BTC", "ETH", "SOL", "TON"];
      var symbols = JSON.stringify(coins.map(function (c) { return c + "USDT"; }));
      fetch("https://api.binance.com/api/v3/ticker/price?symbols=" + symbols)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!active) return;
          var next = { USDT: 1 };
          data.forEach(function (item) {
            next[item.symbol.replace("USDT", "")] = parseFloat(item.price);
          });
          setPrices(next);
        })
        .catch(function () {});
    }
    fetchPrices();
    var iv = setInterval(fetchPrices, 8000);
    return function () { active = false; clearInterval(iv); };
  }, []);

  function roadHome() { navigate(-1); }

  function getAvailable(assetId) {
    if (assetId === "USDT") return wallet.balance;
    var match = card.assets.find(function (a) { return a.id === assetId; });
    return match ? match.amount : 0;
  }

  var fromAmountNum = parseFloat(fromAmount) || 0;
  var fromPrice = prices[fromAsset] || 0;
  var toPrice = prices[toAsset] || 0;
  var usdValue = fromAmountNum * fromPrice;
  var toAmountNum = toPrice > 0 ? usdValue / toPrice : 0;
  var rate = toPrice > 0 && fromPrice > 0 ? fromPrice / toPrice : 0;

  var availableFrom = getAvailable(fromAsset);
  var insufficient = fromAmountNum > availableFrom;

  function handleFlip() {
    var oldFrom = fromAsset;
    setFromAsset(toAsset);
    setToAsset(oldFrom);
    setFromAmount("");
  }

  function handlclassicokAsset(side, assetId) {
    if (side === "from") {
      if (assetId === toAsset) setToAsset(fromAsset);
      setFromAsset(assetId);
    } else {
      if (assetId === fromAsset) setFromAsset(toAsset);
      setToAsset(assetId);
    }
    setPickerOpenFor(null);
  }

  async function handleSubmit() {
    if (fromAmountNum <= 0 || insufficient || isSubmitting) return;
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      var result = await executeSwap(fromAsset, toAsset, fromAmountNum);
      setStatusMsg("Swapped " + fromAmountNum.toFixed(6) + " " + fromAsset + " → " + result.toAmount.toFixed(6) + " " + toAsset);
      setStatusOk(true);
      setFromAmount("");
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
    <div className="SwapContent">
      <div className="Road-Home" onClick={roadHome}></div>

      <div className="crd-page">

        <div className="crd-header">
          <span className="crd-eyebrow">Card</span>
          <h1 className="crd-title">Swap</h1>
        </div>

        <div className="swp-box">
          <div className="swp-row-header">
            <span>You pay</span>
            <span className="swp-available">{"Available " + availableFrom.toFixed(6)}</span>
          </div>
          <div className="swp-row">
            <input
              type="number"
              className="swp-input"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
            <button className="swp-asset-btn" onClick={() => setPickerOpenFor(pickerOpenFor === "from" ? null : "from")}>
              {fromAsset} <span className="swp-chevron">›</span>
            </button>
          </div>
          {pickerOpenFor === "from" && (
            <div className="swp-picker">
              {ASSETS.map(function (a) {
                return (
                  <div key={a.id} className="swp-picker-item" onClick={() => handlclassicokAsset("from", a.id)}>
                    <span>{a.id}</span>
                    <span className="swp-picker-label">{a.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="swp-flip-wrap">
          <button className="swp-flip-btn" onClick={handleFlip}><SwapArrowIcon /></button>
        </div>

        <div className="swp-box">
          <div className="swp-row-header">
            <span>You receive</span>
          </div>
          <div className="swp-row">
            <div className="swp-receive-amount">{toAmountNum > 0 ? toAmountNum.toFixed(6) : "0"}</div>
            <button className="swp-asset-btn" onClick={() => setPickerOpenFor(pickerOpenFor === "to" ? null : "to")}>
              {toAsset} <span className="swp-chevron">›</span>
            </button>
          </div>
          {pickerOpenFor === "to" && (
            <div className="swp-picker">
              {ASSETS.map(function (a) {
                return (
                  <div key={a.id} className="swp-picker-item" onClick={() => handlclassicokAsset("to", a.id)}>
                    <span>{a.id}</span>
                    <span className="swp-picker-label">{a.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {rate > 0 && (
          <div className="swp-rate-line">{"1 " + fromAsset + " ≈ " + rate.toFixed(6) + " " + toAsset}</div>
        )}

        {insufficient && fromAmountNum > 0 && (
          <div className="crd-alert">Insufficient {fromAsset}</div>
        )}

        {statusMsg && (
          <div className={"crd-status " + (statusOk ? "ok" : "err")}>{statusMsg}</div>
        )}

        <button className="swp-submit-btn" disabled={fromAmountNum <= 0 || insufficient || isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "Processing..." : "Review Swap"}
        </button>

      </div>
    </div>
  );
};

export default Swap;