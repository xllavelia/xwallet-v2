import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletBalance } from "./useWallet";
import { useCard, executeSwap } from "./useCard";

var ASSETS = [
  { id: "USDT", label: "Tether", color: "#26a17b", glyph: "$" },
  { id: "BTC", label: "Bitcoin", color: "#f7931a", glyph: "₿" },
  { id: "ETH", label: "Ethereum", color: "#8c8fee", glyph: "Ξ" },
  { id: "SOL", label: "Solana", color: "#14f195", glyph: "◎" },
  { id: "TON", label: "Toncoin", color: "#0098ea", glyph: "◆" }
];

function SwapVerticalIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 10 12 5 17 10"></polyline><line x1="12" y1="5" x2="12" y2="15"></line><polyline points="7 14 12 19 17 14"></polyline><line x1="12" y1="19" x2="12" y2="9"></line></svg>);
}
function ChevronDown() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>);
}

function assetMeta(id) { return ASSETS.find(function (a) { return a.id === id; }) || ASSETS[0]; }

const Swap = () => {
  const navigate = useNavigate();

  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var { card, refresh: refreshCard } = useCard();

  var [fromAsset, setFromAsset] = useState("USDT");
  var [toAsset, setToAsset] = useState("BTC");
  var [fromAmount, setFromAmount] = useState("");
  var [prices, setPrices] = useState({});
  var [pickerOpenFor, setPickerOpenFor] = useState(null);
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);

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
          data.forEach(function (item) { next[item.symbol.replace("USDT", "")] = parseFloat(item.price); });
          setPrices(next);
        })
        .catch(function () {});
    }
    fetchPrices();
    var iv = setInterval(fetchPrices, 8000);
    return function () { active = false; clearInterval(iv); };
  }, []);

  function getAvailable(assetId) {
    if (assetId === "USDT") return wallet.balance;
    var match = card.assets ? card.assets.find(function (a) { return a.id === assetId; }) : null;
    return match ? match.amount : 0;
  }

  var fromAmountNum = parseFloat(fromAmount) || 0;
  var fromPrice = prices[fromAsset] || 0;
  var toPrice = prices[toAsset] || 0;
  var toAmountNum = toPrice > 0 ? (fromAmountNum * fromPrice) / toPrice : 0;
  var rate = toPrice > 0 && fromPrice > 0 ? fromPrice / toPrice : 0;
  var availableFrom = getAvailable(fromAsset);
  var insufficient = fromAmountNum > availableFrom;

  function handleFlip() {
    var oldFrom = fromAsset;
    setFromAsset(toAsset);
    setToAsset(oldFrom);
    setFromAmount("");
  }
  function handlePickAsset(side, assetId) {
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
      setStatusMsg("Swapped into " + result.toAmount.toFixed(6) + " " + toAsset);
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

  var fromMeta = assetMeta(fromAsset);
  var toMeta = assetMeta(toAsset);

  return (
    <div className="txn-page">
      <div className="Road-Home" onClick={() => navigate(-1)}></div>

      <div className="txn-top-badge"><span>Swap</span></div>

      <div className="swpx-box">
        <div className="swpx-row-top">
          <span>You pay</span>
          <button className="swpx-fund-link" onClick={() => setFromAmount(availableFrom.toString())}>Use max · {availableFrom.toFixed(4)}</button>
        </div>
        <div className="swpx-row-main">
          <input type="number" className="swpx-input" placeholder="0" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} />
          <button className="swpx-asset-btn" onClick={() => setPickerOpenFor(pickerOpenFor === "from" ? null : "from")}>
            <span style={{ color: fromMeta.color }}>{fromMeta.glyph}</span> {fromAsset} <ChevronDown />
          </button>
        </div>
        {pickerOpenFor === "from" && (
          <div className="swpx-picker">
            {ASSETS.map(function (a) {
              return (
                <div key={a.id} className="swpx-picker-item" onClick={() => handlePickAsset("from", a.id)}>
                  <span style={{ color: a.color }}>{a.glyph}</span>
                  <div className="swpx-picker-text"><span>{a.id}</span><span className="swpx-picker-sub">{a.label}</span></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="swpx-flip-wrap">
        <button className="swpx-flip-btn" onClick={handleFlip}><SwapVerticalIcon /></button>
      </div>

      <div className="swpx-box">
        <div className="swpx-row-top"><span>You receive</span></div>
        <div className="swpx-row-main">
          <div className="swpx-receive">{toAmountNum > 0 ? toAmountNum.toFixed(6) : "0"}</div>
          <button className="swpx-asset-btn" onClick={() => setPickerOpenFor(pickerOpenFor === "to" ? null : "to")}>
            <span style={{ color: toMeta.color }}>{toMeta.glyph}</span> {toAsset} <ChevronDown />
          </button>
        </div>
        {pickerOpenFor === "to" && (
          <div className="swpx-picker">
            {ASSETS.map(function (a) {
              return (
                <div key={a.id} className="swpx-picker-item" onClick={() => handlePickAsset("to", a.id)}>
                  <span style={{ color: a.color }}>{a.glyph}</span>
                  <div className="swpx-picker-text"><span>{a.id}</span><span className="swpx-picker-sub">{a.label}</span></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {rate > 0 && <div className="swpx-rate-line">{"1 " + fromAsset + " ≈ " + rate.toFixed(6) + " " + toAsset}</div>}
      {insufficient && fromAmountNum > 0 && <div className="txn-alert">Insufficient {fromAsset}</div>}
      {statusMsg && <div className={"txn-status " + (statusOk ? "ok" : "err")}>{statusMsg}</div>}

      <div className="txn-bottom">
        <button className="txn-submit-btn buy" disabled={fromAmountNum <= 0 || insufficient || isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "Processing..." : "Review Swap"}
        </button>
      </div>
    </div>
  );
};

export default Swap;