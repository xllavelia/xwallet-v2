import React from "react";
import { useNavigate } from "react-router-dom";
import { useCard } from "./useCard";

var COIN_META = {
  BTC: { glyph: "₿", color: "#f7931a" },
  ETH: { glyph: "Ξ", color: "#8c8fee" },
  SOL: { glyph: "◎", color: "#14f195" },
  TON: { glyph: "◆", color: "#0098ea" }
};

function BuyIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>);
}
function SellIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>);
}
function SwapIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>);
}

function formatUsd(n) { return "$" + n.toFixed(2); }
function formatAmount(n, id) {
  var decimals = n < 0.01 ? 5 : (n < 1 ? 4 : 2);
  return n.toFixed(decimals) + " " + id;
}

const Card = () => {
  const navigate = useNavigate();
  var { card } = useCard();

  function roadSwap (){
     navigate(-1);
    setTimeout(function () {
      navigate('/swap');
    }, 20);
  }


  function roadBuy (){
     navigate(-1);
    setTimeout(function () {
      navigate("/tradecoin", { state: { direction: "buy" } })
    }, 20);
  }

  function roadSell (){
   navigate(-1);
    setTimeout(function () {
      navigate("/tradecoin", { state: { direction: "sell" } })
    }, 20);
  }


  var assets = card.assets || [];

  return (
    <div className="crdx-page">

      <div className="crdx-header">
        <span className="crdx-eyebrow">Wallet</span>
        <h1 className="crdx-title">Crypto Card</h1>
      </div>

      <div className="crdx-hero">
        <span className="crdx-hero-label">Total Value</span>
        <span className="crdx-hero-value">{formatUsd(card.balanceUsd || 0)}</span>
        <span className="crdx-hero-sub">{"Card ····" + (card.cardNumber || "").slice(-4)}</span>
      </div>

      <div className="crdx-actions">
        <button className="crdx-action" onClick={roadBuy}>
          <BuyIcon /><span>Buy</span>
        </button>
        <button className="crdx-action" onClick={roadSwap}>
          <SwapIcon /><span>Swap</span>
        </button>
        <button className="crdx-action" onClick={roadSell}>
          <SellIcon /><span>Sell</span>
        </button>
      </div>

      <div className="crdx-section-title">Assets</div>

      <div className="crdx-asset-list">
        {assets.map(function (a) {
          var meta = COIN_META[a.id] || { glyph: "?", color: "#888" };
          return (
            <div className="crdx-asset-row" key={a.id} onClick={roadSell} >
              <div className="crdx-asset-info">
                <span className="crdx-asset-name">{a.id}</span>
                <span className="crdx-asset-amount">{formatAmount(a.amount || 0, a.id)}</span>
              </div>
              <div className="crdx-asset-right">
                <span className="crdx-asset-value">{formatUsd(a.valueUsd || 0)}</span>
                <span className="crdx-asset-pct">{(a.allocation || 0).toFixed(1) + "%"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Card;