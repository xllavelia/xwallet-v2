import React from "react";
import { useNavigate } from "react-router-dom";
import { useCard } from "./useCard";

var COIN_ICONS = {
  BTC: (<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"><path fill="currentColor" d="M17.06 11.57A3.9 3.9 0 0 0 18 9c0-1.86-1.27-3.43-3-3.87V3h-2v2h-2V3H9v2H6v2h2v10H6v2h3v2h2v-2h2v2h2v-2c2.21 0 4-1.79 4-4c0-1.45-.78-2.73-1.94-3.43M10 7h4c1.1 0 2 .9 2 2s-.9 2-2 2h-4zm5 10h-5v-4h5c1.1 0 2 .9 2 2s-.9 2-2 2" /></svg>),
  ETH: (<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0L4.63 12.22L12 16.574l7.37-4.354zm0 24L4.63 13.617L12 18l7.37-4.383z" /></svg>),
  SOL: (<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 18h12l4-4H8zm4-4l-4-4h12l4 4m-4-4l4-4H8l-4 4" /></svg>),
  TON: (<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" /><path fill="currentColor" d="M17 3a2 2 0 0 1 1.492.668l.108.132l3.704 4.939a2 2 0 0 1-.012 2.416l-.108.13l-9.259 10.184a1.25 1.25 0 0 1-1.753.096l-.097-.096l-9.259-10.185a2 2 0 0 1-.215-2.407l.095-.138L5.4 3.8a2 2 0 0 1 1.43-.793L7 3zm-2.477 8H9.477L12 17.307zm5.217 0h-3.063l-2.406 6.015zM7.323 11H4.261l5.468 6.015zm5.059-6h-.764l-2 4h4.764zM17 5h-2.382l2 4H20zM9.382 5H7L4 9h3.382z" /></g></svg>)
};

function BuyIcon() {
  return (<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>);
}
function SwapIcon() {
  return (<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>);
}
function SellIcon() {
  return (<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>);
}

function formatUsd(n) { return "$" + n.toFixed(2); }
function formatAmount(n, id) {
  var decimals = n < 0.01 ? 5 : (n < 1 ? 4 : 2);
  return n.toFixed(decimals) + " " + id;
}

const Vault = () => {
  const navigate = useNavigate();

  var { card } = useCard();

  var assetCount = card.assets.length;
  var sortedAssets = card.assets.slice().sort(function (a, b) { return b.valueUsd - a.valueUsd; });
  var largestAsset = sortedAssets[0];

  function goBuy() { 
  navigate(-1);
    setTimeout(function () {
    navigate("/tradecoin", { state: { direction: "buy" } });
    }, 20);

   }
  
  function goSwap() { 
        navigate(-1);
    setTimeout(function () {
    navigate("/swap"); 
    }, 20);
  }

  function goSell() { 
      navigate(-1);
    setTimeout(function () {
    navigate("/tradecoin", { state: { direction: "sell" } });
    }, 20);

   }

  return (
    <div className="VaultContent">

      <div className="vlt-page">

        <div className="vlt-eyebrow-block">
          <span className="vlt-eyebrow">Your Vault</span>
          <h1 className="vlt-title">Crypto Storage</h1>
        </div>

        {/* ── HERO CARD ─────────────────────────────────────────── */}
        <div className="mc-card-parent">
          <div className={'mc-item mc-card- ' + 'bg-lime'}>
            <div className="deco-ball ball-1"></div>
            <div className="deco-ball ball-2"></div>
            <div className="deco-ring ring-1"></div>
            <div className="deco-ring ring-2"></div>
            <div className="deco-star"></div>
            <div className="deco-star-2"></div>
            <div className="deco-star-3"></div>
{/* 
            <div className="vlt-card-content">
              <span className="vlt-card-label">Total Balance</span>
              <span className="vlt-card-balance">{formatUsd(card.balanceUsd)}</span>
              <div className="vlt-card-bottom-row">
                <span className="vlt-card-holder">{card.holder}</span>
                <span className="vlt-card-expiry">{card.validThru}</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* ── ACTION TILES ─────────────────────────────────────── */}
        <div className="crd-actions-row">
          <div className="crd-action-tile " onClick={goBuy}>
            <div className="crd-action-icon"><BuyIcon /></div>
            {/* <span className="crd-action-label">Buy</span> */}
          </div>
          <div className="crd-action-tile" onClick={goSwap}>
            <div className="crd-action-icon"><SwapIcon /></div>
            {/* <span className="crd-action-label">Swap</span> */}
          </div>
          <div className="crd-action-tile" onClick={goSell}>
            <div className="crd-action-icon"><SellIcon /></div>
            {/* <span className="crd-action-label">Sell</span> */}
          </div>
        </div>

        {/* ── ALLOCATION ─────────────────────────────────────────── */}
        <div className="vlt-section">
          <div className="vlt-section-header">
            <h2 className="vlt-section-title">Portfolio Breakdown</h2>
            <span className="vlt-section-count">{assetCount + " assets"}</span>
          </div>

          <div className="vlt-alloc-bar">
            {card.assets.map(function (a) {
              var style = { width: a.allocation + "%" };
              return <div className="vlt-alloc-seg" style={style} key={a.id}></div>;
            })}
          </div>

          <div className="vlt-asset-list">
            {card.assets.map(function (a) {
              var fillStyle = { width: a.allocation + "%" };
              return (
                <div className="vlt-asset-row" key={a.id}>
                  <div className="vlt-asset-row-fill" style={fillStyle}></div>
                  <div className="vlt-asset-glyph">{COIN_ICONS[a.id]}</div>
                  <div className="vlt-asset-info">
                    <span className="vlt-asset-name">{a.id}</span>
                    <span className="vlt-asset-amount">{formatAmount(a.amount, a.id)}</span>
                  </div>
                  <div className="vlt-asset-right">
                    <span className="vlt-asset-value">{formatUsd(a.valueUsd)}</span>
                    <span className="vlt-asset-pct">{a.allocation.toFixed(1) + "%"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── INFO ───────────────────────────────────────────────── */}
        <div className="vlt-section">

          <div className="vlt-info-group">
            <h3 className="vlt-group-title">Vault Details</h3>
            <div className="vlt-stats-list">
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Card Number</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">{card.cardNumber}</span>
              </div>
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Network</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">Multi-chain</span>
              </div>
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Custody type</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">Self-custody</span>
              </div>
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Valid thru</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">{card.validThru}</span>
              </div>
            </div>
          </div>

          <div className="vlt-info-group">
            <h3 className="vlt-group-title">Performance</h3>
            <div className="vlt-stats-list">
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Largest holding</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">{largestAsset ? largestAsset.id : "—"}</span>
              </div>
            </div>
          </div>
    <div className="vlt-info-group-div">
          <div className="vlt-info-group">
            <h3 className="vlt-group-title">Documentation</h3>
            <div className="vlt-doc-box">
              <div className="vlt-doc-top">
                <span className="vlt-doc-id">{"ID: " + card.cardNumber}</span>
                <span className="vlt-doc-tag">Self-custody</span>
              </div>
              <p className="vlt-doc-text">
                This vault holds your crypto balance across multiple chains in one unified view.
                Assets stay in their native form until you choose to swap or withdraw.
              </p>
            </div></div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Vault;