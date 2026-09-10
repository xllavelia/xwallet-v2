import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createListing, fetchMarketPrice } from "./useP2P";
import { CRYPTO_ASSETS, STOCK_ASSETS } from "./p2pAssets";

function ChevronLeft() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>); }

const P2PCreateListing = () => {
  const navigate = useNavigate();
  var [side, setSide] = useState("sell");
  var [assetClass, setAssetClass] = useState("crypto");
  var [asset, setAsset] = useState("BTC");
  var [rate, setRate] = useState("");
  var [baseAmount, setBaseAmount] = useState("");
  var [minUsd, setMinUsd] = useState("");
  var [maxUsd, setMaxUsd] = useState("");
  var [note, setNote] = useState("");
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);

  useEffect(function () {
    if (assetClass === "lavx") { setAsset("LAVX"); return; }
    var defaultAsset = assetClass === "crypto" ? CRYPTO_ASSETS[0] : STOCK_ASSETS[0];
    setAsset(defaultAsset);
  }, [assetClass]);

  useEffect(function () {
    if (assetClass === "lavx" || !asset) return;
    fetchMarketPrice(assetClass, asset).then(function (res) {
      if (res.price > 0) setRate(res.price.toFixed(assetClass === "crypto" ? 2 : 2));
    }).catch(function () {});
  }, [assetClass, asset]);

  var assetOptions = assetClass === "crypto" ? CRYPTO_ASSETS : (assetClass === "stock" ? STOCK_ASSETS : []);

  async function handleSubmit() {
    var rateNum = parseFloat(rate);
    var amountNum = parseFloat(baseAmount);
    var minNum = parseFloat(minUsd);
    var maxNum = parseFloat(maxUsd);
    if (!rateNum || !amountNum || !minNum || !maxNum || isSubmitting) {
      setStatusMsg("Fill in all fields");
      return;
    }
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      await createListing({
        side: side, assetClass: assetClass, asset: asset,
        rateUsd: rateNum, minAmountUsd: minNum, maxAmountUsd: maxNum,
        baseAmount: amountNum, paymentNote: note
      });
      navigate("/p2p/merchant");
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p2p-page">
      <div className="p2p-topbar">
        <button className="p2p-icon-btn" onClick={() => navigate(-1)}><ChevronLeft /></button>
        <span className="p2p-title">Create Listing</span>
      </div>

      <div className="p2p-toggle">
        <div className={"p2p-toggle-pill " + (side === "buy" ? "right" : "")}></div>
        <button className={"p2p-toggle-btn " + (side === "sell" ? "active" : "")} onClick={() => setSide("sell")}>I'm Selling</button>
        <button className={"p2p-toggle-btn " + (side === "buy" ? "active" : "")} onClick={() => setSide("buy")}>I'm Buying</button>
      </div>

      <div className="p2p-field-label">Asset Class</div>
      <div className="p2p-filter-row">
        <button className={"p2p-filter-chip " + (assetClass === "crypto" ? "active" : "")} onClick={() => setAssetClass("crypto")}>Crypto</button>
        <button className={"p2p-filter-chip " + (assetClass === "stock" ? "active" : "")} onClick={() => setAssetClass("stock")}>Stocks</button>
        <button className={"p2p-filter-chip " + (assetClass === "lavx" ? "active" : "")} onClick={() => setAssetClass("lavx")}>LAVX</button>
      </div>

      {assetClass === "crypto" && (
        <div className="p2p-asset-chip-row">
          {assetOptions.map(function (a) { return <button key={a} className={"p2p-asset-chip " + (asset === a ? "active" : "")} onClick={() => setAsset(a)}>{a}</button>; })}
        </div>
      )}
      {assetClass === "stock" && (
        <select className="p2p-select" value={asset} onChange={(e) => setAsset(e.target.value)}>
          {assetOptions.map(function (a) { return <option key={a} value={a}>{a}</option>; })}
        </select>
      )}

      <div className="p2p-field-label">{"Rate (USD per " + asset + ")"}</div>
      <div className="p2p-input-row">
        <span className="p2p-input-currency">$</span>
        <input type="number" className="p2p-input" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>

      <div className="p2p-field-label">{"Amount of " + asset + " to list"}</div>
      <div className="p2p-input-row">
        <input type="number" className="p2p-input" placeholder="0" value={baseAmount} onChange={(e) => setBaseAmount(e.target.value)} style={{ fontSize: 20 }} />
        <span className="p2p-input-currency" style={{ fontSize: 14 }}>{asset}</span>
      </div>

      <div className="p2p-field-label">Deal Limits (USD)</div>
      <div className="p2p-field-row">
        <div className="p2p-input-row"><span className="p2p-input-currency" style={{ fontSize: 16 }}>$</span><input type="number" className="p2p-input" placeholder="Min" value={minUsd} onChange={(e) => setMinUsd(e.target.value)} style={{ fontSize: 16 }} /></div>
      </div>

  <div className="p2p-field-row">
        <div className="p2p-input-row"><span className="p2p-input-currency" style={{ fontSize: 16 }}>$</span><input type="number" className="p2p-input" placeholder="Max" value={maxUsd} onChange={(e) => setMaxUsd(e.target.value)} style={{ fontSize: 16 }} /></div>
      </div>

      <div className="p2p-field-label">Note for buyers (optional)</div>
      <textarea className="p2p-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Instant settlement, no delays..." />

      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>A 1% commission applies to every completed deal on this listing.</span>

      {statusMsg && <div className="p2p-status err">{statusMsg}</div>}

      <button className="p2p-primary-btn" disabled={isSubmitting} onClick={handleSubmit}>
        {isSubmitting ? "Creating..." : "Create Listing"}
      </button>
    </div>
  );
};

export default P2PCreateListing;