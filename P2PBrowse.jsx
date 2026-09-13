import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useP2PListings } from "./useP2P";
import { CRYPTO_ASSETS, STOCK_ASSETS, ASSET_CLASSES } from "./p2pAssets";
import { backToP2PMarket } from "./p2pNav";

function ChevronLeft() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>); }

const P2PBrowse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  var side = (location.state && location.state.side) || "buy";

  var [assetClass, setAssetClass] = useState("all");
  var [asset, setAsset] = useState("");
  var [amountUsd, setAmountUsd] = useState("");
  var [officialOnly, setOfficialOnly] = useState(false);

  var { listings, isLoading } = useP2PListings(side, { assetClass: assetClass, asset: asset, amountUsd: amountUsd, officialOnly: officialOnly });

  function handleAssetClass(cls) {
    setAssetClass(cls);
    setAsset("");
  }

  var assetOptions = assetClass === "crypto" ? CRYPTO_ASSETS : (assetClass === "stock" ? STOCK_ASSETS : []);

  return (
    <div className="p2p-page">
      <div className="p2p-topbar">
<button className="p2p-icon-btn" onClick={() => backToP2PMarket(navigate)}><ChevronLeft /></button>        <span className="p2p-title">{side === "buy" ? "Buy Assets" : "Sell Assets"}</span>
      </div>

      <div className="p2p-filter-row">
        {ASSET_CLASSES.map(function (c) {
          return <button key={c.id} className={"p2p-filter-chip " + (assetClass === c.id ? "active" : "")} onClick={() => handleAssetClass(c.id)}>{c.label}</button>;
        })}
        <button className={"p2p-filter-chip " + (officialOnly ? "active" : "")} onClick={() => setOfficialOnly(!officialOnly)}>Official only</button>
      </div>

      {assetOptions.length > 0 && (
        <div className="p2p-asset-chip-row">
          {assetOptions.map(function (a) {
            return <button key={a} className={"p2p-asset-chip " + (asset === a ? "active" : "")} onClick={() => setAsset(asset === a ? "" : a)}>{a}</button>;
          })}
        </div>
      )}

      <div className="p2p-amount-filter">
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>$</span>
        <input type="number" placeholder="Filter by amount (USD)" value={amountUsd} onChange={(e) => setAmountUsd(e.target.value)} />
      </div>

      {isLoading && <div className="p2p-empty"><span className="p2p-empty-sub">Loading listings...</span></div>}

      {!isLoading && listings.length === 0 && (
        <div className="p2p-empty">
          <span className="p2p-empty-title">No listings found</span>
          <span className="p2p-empty-sub">Try adjusting your filters</span>
        </div>
      )}

      {!isLoading && listings.map(function (l) {
        return (
          <div className="p2p-listing-row" key={l.id} onClick={() => navigate("/p2plisting", {state: {listing: l}})}>
            <div className="p2p-listing-top">
              <span className="p2p-listing-rate">
                {"$" + l.rateUsd.toLocaleString("en-US")}
                {l.isOfficial && <span className="p2p-listing-official">✓ Official</span>}
              </span>
              <button className={"p2p-listing-action-btn " + side}>{side === "buy" ? "Buy" : "Sell"}</button>
            </div>
            <div className="p2p-listing-poster">
              <div className="p2p-poster-avatar">{l.username.slice(0, 2).toUpperCase()}</div>
              <span className="p2p-poster-name">{l.username}</span>
              <span className="p2p-poster-stats">{l.totalDeals + " deals · " + l.successRate.toFixed(0) + "%"}</span>
            </div>
            <div className="p2p-listing-meta">
              <span>Available <b>{l.remainingBaseAmount.toFixed(l.assetClass === "stock" ? 4 : 6) + " " + l.baseAsset}</b></span>
              <span>Limits <b>{"$" + l.minAmountUsd.toFixed(0) + " – $" + l.maxAmountUsd.toFixed(0)}</b></span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default P2PBrowse;