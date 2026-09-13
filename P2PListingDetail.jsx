import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createDeal } from "./useP2P";
import { backToP2PMarket } from "./p2pNav";

function ChevronLeft() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>); }

const P2PListingDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  var listing = location.state && location.state.listing;

  var [amount, setAmount] = useState("");
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);

  if (!listing) {
    return (
      <div className="p2p-page">
        <div className="p2p-empty">
          <span className="p2p-empty-title">Listing not found</span>
          <button className="p2p-primary-btn" style={{ marginTop: 12 }} onClick={() => navigate("/p2p")}>Back to Market</button>
        </div>
      </div>
    );
  }

  var usdAmount = parseFloat(amount) || 0;
  var baseEstimate = listing.rateUsd > 0 ? usdAmount / listing.rateUsd : 0;
  var inRange = usdAmount >= listing.minAmountUsd && usdAmount <= listing.maxAmountUsd;

  async function handleReview() {
    if (usdAmount <= 0 || !inRange || isSubmitting) return;
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      var result = await createDeal(listing.id, usdAmount);
      navigate("/p2pdeal", { state: { dealId: result.dealId } });
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  var actionWord = listing.side === "sell" ? "buying" : "selling";

  return (
    <div className="p2p-page">
      <div className="p2p-topbar">
<button className="p2p-icon-btn" onClick={() => backToP2PMarket(navigate)}><ChevronLeft /></button>
        <span className="p2p-title">{"You are " + actionWord}</span>
      </div>

      <div className="p2p-card" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="p2p-poster-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>{listing.username.slice(0, 2).toUpperCase()}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{listing.username}{listing.isOfficial ? " ✓" : ""}</span>
          <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>{listing.totalDeals + " deals · " + listing.successRate.toFixed(0) + "% success"}</span>
        </div>
      </div>

      <div className="p2p-field-label">Amount (USD)</div>
      <div className="p2p-input-row">
        <span className="p2p-input-currency">$</span>
        <input type="number" className="p2p-input" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <span className="p2p-input-hint">
        {"≈ " + baseEstimate.toFixed(listing.assetClass === "stock" ? 4 : 6) + " " + listing.baseAsset + " at $" + listing.rateUsd.toLocaleString("en-US")}
      </span>
      <span className="p2p-input-hint">{"Limits: $" + listing.minAmountUsd.toFixed(0) + " – $" + listing.maxAmountUsd.toFixed(0)}</span>

      {listing.paymentNote && (
        <div className="p2p-card">
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--xlavelia)", display: "block", marginBottom: 6 }}>Seller note</span>
          <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{listing.paymentNote}</span>
        </div>
      )}

      {!inRange && usdAmount > 0 && <div className="p2p-status err">Amount must be within the listing's limits</div>}
      {statusMsg && <div className="p2p-status err">{statusMsg}</div>}

      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
        All trades settle instantly within xWallet — no external steps needed.
      </span>

      <button className="p2p-primary-btn" disabled={usdAmount <= 0 || !inRange || isSubmitting} onClick={handleReview}>
        {isSubmitting ? "Processing..." : "Review Deal"}
      </button>
    </div>
  );
};

export default P2PListingDetail;