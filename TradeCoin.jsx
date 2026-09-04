import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWalletBalance } from "./useWallet";
import { useCard, executeTrade } from "./useCard";

var COINS = [
  { id: "BTC", glyph: "₿", color: "#f7931a" },
  { id: "ETH", glyph: "Ξ", color: "#8c8fee" },
  { id: "SOL", glyph: "◎", color: "#14f195" },
  { id: "TON", glyph: "◆", color: "#0098ea" }
];

function SwapArrows() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 10 12 5 17 10"></polyline><line x1="12" y1="5" x2="12" y2="16"></line></svg>);
}
function ChevronDown() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>);
}
function PlusIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
}

const TradeCoin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  var prefillDirection = (location.state && location.state.direction) || "buy";
  var prefillCoin = (location.state && location.state.coin) || "BTC";

  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var { card, refresh: refreshCard } = useCard();

  var [direction, setDirection] = useState(prefillDirection);
  var [coin, setCoin] = useState(prefillCoin);
  var [amount, setAmount] = useState("");
  var [livePrice, setLivePrice] = useState(0);
  var [pickerOpen, setPickerOpen] = useState(false);
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);

  useEffect(function () {
    var active = true;
    function fetchPrice() {
      fetch("https://api.binance.com/api/v3/ticker/price?symbol=" + coin + "USDT")
        .then(function (r) { return r.json(); })
        .then(function (d) { if (active) setLivePrice(parseFloat(d.price) || 0); })
        .catch(function () {});
    }
    fetchPrice();
    var iv = setInterval(fetchPrice, 8000);
    return function () { active = false; clearInterval(iv); };
  }, [coin]);

  var coinMeta = COINS.find(function (c) { return c.id === coin; }) || COINS[0];
  var isBuy = direction === "buy";
  var usdAmount = parseFloat(amount) || 0;
  var coinAmount = livePrice > 0 ? usdAmount / livePrice : 0;

  var assetMatch = card.assets ? card.assets.find(function (a) { return a.id === coin; }) : null;
  var coinHeldAmount = assetMatch ? assetMatch.amount : 0;
  var maxUsdForSell = coinHeldAmount * livePrice;
  var insufficient = isBuy ? usdAmount > wallet.balance : usdAmount > maxUsdForSell;

  function handlePreset(pct) {
    var available = isBuy ? wallet.balance : maxUsdForSell;
    setAmount((available * pct).toFixed(2));
  }

  async function handleSubmit() {
    if (usdAmount <= 0 || insufficient || isSubmitting) return;
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      var result = await executeTrade(coin, usdAmount, direction);
      setStatusMsg((isBuy ? "Bought " : "Sold ") + result.coinAmount.toFixed(6) + " " + coin);
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

  var rateStr = livePrice > 0 ? ("1 " + coin + " ≈ $" + livePrice.toLocaleString("en-US")) : "Loading rate...";

  return (
    <div className="txn-page">
      <div className="Road-Home" onClick={() => navigate(-1)}></div>

      <div className="txn-top-badge">
        <span className="txn-coin-dot" style={{ background: coinMeta.color + "22", color: coinMeta.color }}>{coinMeta.glyph}</span>
        <span>{(isBuy ? "Buying " : "Selling ") + coin}</span>
      </div>

      <div className="txn-center">
        <div className="txn-amount-row">
          <span className="txn-cursor"></span>
          <span className={"txn-amount " + (usdAmount > 0 ? "" : "dim")}>{amount || "0"}</span>
          <span className="txn-currency">USD</span>
        </div>

        <div className="txn-rate-row">
          <span>{rateStr}</span>
        </div>

        <button className="txn-topup-link" onClick={() => setAmount(wallet.balance.toFixed(2))}>
          <PlusIcon /> Use max available
        </button>
      </div>

      <div className="txn-presets">
        {[0.25, 0.5, 0.75, 1].map(function (pct) {
          return <button key={pct} className="txn-preset-btn" onClick={() => handlePreset(pct)}>{pct === 1 ? "MAX" : (pct * 100) + "%"}</button>;
        })}
      </div>

      {insufficient && usdAmount > 0 && (
        <div className="txn-alert">Insufficient {isBuy ? "balance" : coin}</div>
      )}
      {statusMsg && <div className={"txn-status " + (statusOk ? "ok" : "err")}>{statusMsg}</div>}

      <div className="txn-bottom">
        <div className="txn-method-row" onClick={() => setPickerOpen(!pickerOpen)}>
          <span className="txn-method-dot"><SwapArrows /></span>
          <span className="txn-method-label">{isBuy ? "Buy with USD" : "Sell for USD"}</span>
          <ChevronDown />
        </div>

        {pickerOpen && (
          <div className="txn-picker">
            <button className={"txn-picker-toggle " + (isBuy ? "active" : "")} onClick={() => setDirection("buy")}>Buy</button>
            <button className={"txn-picker-toggle " + (!isBuy ? "active" : "")} onClick={() => setDirection("sell")}>Sell</button>
            <div className="txn-picker-coins">
              {COINS.map(function (c) {
                return (
                  <button key={c.id} className={"txn-picker-coin " + (coin === c.id ? "active" : "")} onClick={() => { setCoin(c.id); setPickerOpen(false); }}>
                    <span style={{ color: c.color }}>{c.glyph}</span> {c.id}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button className={"txn-submit-btn " + (isBuy ? "buy" : "sell")} disabled={usdAmount <= 0 || insufficient || isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "Processing..." : "Review Trade"}
        </button>
      </div>
    </div>
  );
};

export default TradeCoin;