import React from "react";
import { useNavigate } from "react-router-dom";
import { useCard } from "./useCard";


function BuyIcon() {
  return (<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>);
}
function SwapIcon() {
  return (<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>);
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

        {/* <div className="mc-card-parent">
          <div className={'mc-item mc-card- ' + 'bg-lime'}>
            <div className="deco-ball ball-1"></div>
            <div className="deco-ball ball-2"></div>
            <div className="deco-ring ring-1"></div>
            <div className="deco-ring ring-2"></div>
            <div className="deco-star"></div>
            <div className="deco-star-2"></div>
            <div className="deco-star-3"></div>

          </div>
        </div> */}

     
       
          {/* <div className="crd-action-tile " onClick={goBuy}>
            <div className="crd-action-icon"><BuyIcon /></div>
          </div>
          <div className="crd-action-tile" onClick={goSwap}>
            <div className="crd-action-icon"><SwapIcon /></div>
          </div>
          <div className="crd-action-tile" onClick={goSell}>
            <div className="crd-action-icon"><SellIcon /></div>
          </div> */}

            <div  className="mini-card-actions">
      <button  className="btn-mini-card- btn-swap" onClick={goSwap}>Swap</button>
      <button  className="btn-mini-card- btn-buy" onClick={goBuy}>Buy</button>
      <button  className="btn-mini-card- btn-send" onClick={goSell}>Sell</button>
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
                  {/* <div className="vlt-asset-glyph">{COIN_ICONS[a.id]}</div> */}
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