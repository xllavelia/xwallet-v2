import React from "react";
import { useNavigate } from "react-router-dom";


// ─────────────────────────────────────────────────────────────────
// STATIC VAULT DATA — replace this whole object with a real fetch/hook
// later, e.g. const vault = useVaultData(); // GET /api/vault
// Keep the exact same shape (id, holder, cardNumber, assets[]...)
// and nothing else in this file needs to change.
// ─────────────────────────────────────────────────────────────────
var VAULT = {
  id: "VLT-7901-4581",
  holder: "XLAVELIA LAGA",
  cardNumber: "7901 5172 8172 4581",
  expiry: "08/24",
  network: "Multi-chain",
  custody: "Self-custody",
  createdOn: "Feb 2026",
  yieldApr: "3.2%",
  autoConvert: false,
  balanceUsd: 17.24,
  assets: [
    { id: "BTC", name: "Bitcoin",  amount: 0.00012, valueUsd: 8.10, allocation: 47, glyph: (<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"><path fill="currentColor" d="M17.06 11.57A3.9 3.9 0 0 0 18 9c0-1.86-1.27-3.43-3-3.87V3h-2v2h-2V3H9v2H6v2h2v10H6v2h3v2h2v-2h2v2h2v-2c2.21 0 4-1.79 4-4c0-1.45-.78-2.73-1.94-3.43M10 7h4c1.1 0 2 .9 2 2s-.9 2-2 2h-4zm5 10h-5v-4h5c1.1 0 2 .9 2 2s-.9 2-2 2" /></svg>)},
    { id: "ETH", name: "Ethereum", amount: 0.0021,  valueUsd: 5.20, allocation: 30, glyph: (<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0L4.63 12.22L12 16.574l7.37-4.354zm0 24L4.63 13.617L12 18l7.37-4.383z" /></svg>) },
    { id: "SOL", name: "Solana",   amount: 0.018,   valueUsd: 2.70, allocation: 16, glyph: (<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18h12l4-4H8zm4-4l-4-4h12l4 4m-4-4l4-4H8l-4 4" /></svg>) },
    { id: "TON", name: "Toncoin",  amount: 3.4,     valueUsd: 1.24, allocation: 7,  glyph: (<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" /><path fill="currentColor" d="M17 3a2 2 0 0 1 1.492.668l.108.132l3.704 4.939a2 2 0 0 1-.012 2.416l-.108.13l-9.259 10.184a1.25 1.25 0 0 1-1.753.096l-.097-.096l-9.259-10.185a2 2 0 0 1-.215-2.407l.095-.138L5.4 3.8a2 2 0 0 1 1.43-.793L7 3zm-2.477 8H9.477L12 17.307zm5.217 0h-3.063l-2.406 6.015zM7.323 11H4.261l5.468 6.015zm5.059-6h-.764l-2 4h4.764zM17 5h-2.382l2 4H20zM9.382 5H7L4 9h3.382z" /></g></svg>) }
  ]
};

function formatUsd(n) { return "$" + n.toFixed(2); }
function formatAmount(n, id) {
  var decimals = n < 0.01 ? 5 : (n < 1 ? 4 : 2);
  return n.toFixed(decimals) + " " + id;
}

const Vault = () => {
  const navigate = useNavigate();
 

  var largestAsset = VAULT.assets[0]; // pre-sorted by allocation desc
  var assetCount = VAULT.assets.length;

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
{/* <div className="vlt-card-sweep"></div> */}

          <div className="mc-top">
            <div>
              <div className="mc-label">Current Balance</div>
              <div className="mc-balance">$17.24</div>
            </div>
            <div className="mc-contactless">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 21.3c-2.8-2.6-4.5-6.4-4.5-10.6 0-4.2 1.7-8 4.5-10.6"></path>
                <path d="M12.5 18.5c-2-1.9-3.2-4.6-3.2-7.6 0-3 1.2-5.7 3.2-7.6"></path>
                <path d="M16 15.2c-1.1-1.1-1.8-2.6-1.8-4.3 0-1.7.7-3.2 1.8-4.3"></path>
                <path d="M19 12c0-.8-.3-1.6-.8-2.2"></path>
              </svg>
            </div>
          </div>

          <div className="mc-bottom">
            <div className="mc-info-row">
              <span>{VAULT.holder}</span>
              <span>{VAULT.expiry}</span>
            </div>
            <div className="mc-number-row">
              <span>{VAULT.cardNumber}</span>
              <div className="mc-mastercard">
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#eb001b" fillOpacity="0.9"></circle>
                  <circle cx="22" cy="10" r="10" fill="#f79e1b" fillOpacity="0.9"></circle>
                </svg>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* ── ALLOCATION ─────────────────────────────────────────── */}
        <div className="vlt-section">
          <div className="vlt-section-header">
            <h2 className="vlt-section-title">Portfolio Breakdown</h2>
            <span className="vlt-section-count">{assetCount + " assets"}</span>
          </div>

          <div className="vlt-alloc-bar">
            {VAULT.assets.map(function (a, idx) {
              var style = { width: a.allocation + "%", opacity: 1};
              return <div className="vlt-alloc-seg" style={style} key={a.id}></div>;
            })}
          </div>

          <div className="vlt-asset-list">
            {VAULT.assets.map(function (a, idx) {
              var chipStyle = { opacity: 1 - idx * 0.15 };
              var fillStyle = { width: a.allocation + "%" };
              return (
                <div className="vlt-asset-row" key={a.id}>
                  <div className="vlt-asset-row-fill"></div>
                  <div className="vlt-asset-glyph" >{a.glyph}</div>
                  <div className="vlt-asset-info">
                    <span className="vlt-asset-name">{a.name}</span>
                    <span className="vlt-asset-amount">{formatAmount(a.amount, a.id)}</span>
                  </div>
                  <div className="vlt-asset-right">
                    <span className="vlt-asset-value">{formatUsd(a.valueUsd)}</span>
                    <span className="vlt-asset-pct">{a.allocation + "%"}</span>
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
                <span className="vlt-s-label">Storage ID</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">{VAULT.id}</span>
              </div>
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Network</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">{VAULT.network}</span>
              </div>
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Custody type</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">{VAULT.custody}</span>
              </div>
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Created on</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">{VAULT.createdOn}</span>
              </div>
            </div>
          </div>

          <div className="vlt-info-group">
            <h3 className="vlt-group-title">Performance</h3>
            <div className="vlt-stats-list">
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Est. yield (APR)</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value vlt-s-highlight">{VAULT.yieldApr}</span>
              </div>
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Largest holding</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">{largestAsset.name}</span>
              </div>
              <div className="vlt-stats-item">
                <span className="vlt-s-label">Auto-convert</span>
                <span className="vlt-s-dots"></span>
                <span className="vlt-s-value">{VAULT.autoConvert ? "ON" : "OFF"}</span>
              </div>
            </div>
          </div>

          <div className="vlt-info-group">
            <h3 className="vlt-group-title">Documentation</h3>
            <div className="vlt-doc-box">
              <div className="vlt-doc-top">
                <span className="vlt-doc-id">{"ID: " + VAULT.id}</span>
                <span className="vlt-doc-tag">Self-custody</span>
              </div>
              <p className="vlt-doc-text">
                This vault holds your crypto balance across multiple chains in one unified view.
                Assets stay in their native form until you choose to swap or withdraw.
              </p>
              <div className="vlt-legal-row">
                <a href="#terms">Terms of Use</a>
                <span className="vlt-sep">·</span>
                <a href="#privacy">Privacy Policy</a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Vault;