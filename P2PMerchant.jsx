import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchantStatus, useMyListings, becomeMerchant, withdrawMerchantDeposit, closeListing } from "./useP2P";
import { backToP2PMarket } from "./p2pNav";

function ChevronLeft() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>); }
function DollarIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>); }

const P2PMerchant = () => {
  const navigate = useNavigate();
  var { status, refresh } = useMerchantStatus();
  var { listings, refresh: refreshListings } = useMyListings();
  var [isBusy, setIsBusy] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);

  if (!status) return <div className="p2p-page"></div>;

  async function handleBecomeMerchant() {
    setIsBusy(true);
    setStatusMsg(null);
    try {
      await becomeMerchant();
      refresh();
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setIsBusy(false);
    }
  }
  function roadCreate (){
   navigate(-1);
    setTimeout(function () {
      navigate("/p2pcreatelisting")
    }, 20);
  }


  async function handleWithdraw() {
    setIsBusy(true);
    setStatusMsg(null);
    try {
      await withdrawMerchantDeposit();
      refresh();
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCloseListing(id) {
    setIsBusy(true);
    try {
      await closeListing(id);
      refreshListings();
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setIsBusy(false);
    }
  }

  if (!status.isMerchant) {
    return (
      <div className="p2p-page">
        <div className="p2p-topbar">
<button className="p2p-icon-btn" onClick={() => backToP2PMarket(navigate)}><ChevronLeft /></button>
          <span className="p2p-title">Become a Merchant</span>
        </div>

        <div className="p2p-card">
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            Merchants can create P2P listings to buy or sell crypto, stocks, USD, and LAVX directly with other users.
          </span>
        </div>

        <div className="p2p-onboard-step">
          <div className="p2p-onboard-icon"><DollarIcon /></div>
          <div className="p2p-onboard-text">
            <span className="p2p-onboard-title">{"Guarantee deposit — $" + status.requiredDeposit.toFixed(0)}</span>
            <span className="p2p-onboard-sub">Refundable when you stop being a merchant</span>
          </div>
        </div>

        {statusMsg && <div className="p2p-status err">{statusMsg}</div>}

        <button className="p2p-primary-btn" disabled={isBusy} onClick={handleBecomeMerchant}>
          {isBusy ? "Processing..." : "Become a Merchant"}
        </button>
      </div>
    );
  }

  return (
    <div className="p2p-page">
      <div className="p2p-topbar">
<button className="p2p-icon-btn" onClick={() => backToP2PMarket(navigate)}><ChevronLeft /></button>
        <span className="p2p-title">Merchant Dashboard</span>
      </div>

      <div className="p2p-card">
        <div className="p2p-stats-row">
          <div className="p2p-stat"><span className="p2p-stat-value">{status.totalDeals}</span><span className="p2p-stat-label">Total Deals</span></div>
          <div className="p2p-stat"><span className="p2p-stat-value">{status.completedDeals}</span><span className="p2p-stat-label">Completed</span></div>
          <div className="p2p-stat"><span className="p2p-stat-value">{status.successRate.toFixed(0) + "%"}</span><span className="p2p-stat-label">Success</span></div>
        </div>
      </div>

      <button className="p2p-primary-btn" onClick={roadCreate}>+ Create Listing</button>

      <div className="p2p-field-label">Your Listings</div>
      {listings.length === 0 && <div className="p2p-empty"><span className="p2p-empty-sub">No listings yet</span></div>}
      {listings.map(function (l) {
        return (
          <div className="p2p-listing-row" key={l.id}>
            <div className="p2p-listing-top">
              <span className="p2p-listing-rate">{(l.side === "sell" ? "Sell " : "Buy ") + l.baseAsset}</span>
              <span className={"p2p-badge-pill " + (l.status === "active" ? "completed" : "cancelled")}>{l.status.toUpperCase()}</span>
            </div>
            <div className="p2p-listing-meta">
              <span>{"Rate $" + l.rateUsd.toLocaleString("en-US")}</span>
              <span>{"Remaining " + l.remainingBaseAmount.toFixed(6) + " " + l.baseAsset}</span>
            </div>
            {l.status === "active" && (
              <button className="p2p-secondary-btn" disabled={isBusy} onClick={() => handleCloseListing(l.id)}>Close Listing</button>
            )}
          </div>
        );
      })}

      {statusMsg && <div className="p2p-status err">{statusMsg}</div>}

      <button className="p2p-secondary-btn" disabled={isBusy} onClick={handleWithdraw}>
        {"Withdraw Deposit ($" + status.depositAmount.toFixed(2) + ")"}
      </button>
    </div>
  );
};

export default P2PMerchant;