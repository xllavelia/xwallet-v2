import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchDealDetail, confirmDeal, cancelDeal } from "./useP2P";
import { navigateP2P } from "./p2pNavigate";

function ChevronLeft() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>); }

function formatCountdown(expiresAt) {
  var ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "00:00";
  var s = Math.floor(ms / 1000);
  var m = Math.floor(s / 60);
  var sec = s % 60;
  return (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
}

const P2PDealStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  var dealId = location.state && location.state.dealId;

  var [deal, setDeal] = useState(null);
  var [now, setNow] = useState(Date.now());
  var [isBusy, setIsBusy] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);

  useEffect(function () {
    if (!dealId) return;
    var cancelled = false;
    function poll() {
      fetchDealDetail(dealId).then(function (d) { if (!cancelled) setDeal(d); }).catch(function () {});
    }
    poll();
    var iv = setInterval(poll, 3000);
    return function () { cancelled = true; clearInterval(iv); };
  }, [dealId]);

  useEffect(function () {
    var iv = setInterval(function () { setNow(Date.now()); }, 1000);
    return function () { clearInterval(iv); };
  }, []);

  if (!deal) {
    return <div className="p2p-page"></div>;
  }

  async function handleConfirm() {
    setIsBusy(true);
    setStatusMsg(null);
    try {
      await confirmDeal(deal.id);
      var updated = await fetchDealDetail(deal.id);
      setDeal(updated);
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCancel() {
    setIsBusy(true);
    try {
      await cancelDeal(deal.id);
      var updated = await fetchDealDetail(deal.id);
      setDeal(updated);
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setIsBusy(false);
    }
  }

  var isPending = deal.status === "awaiting_payment";
  var isExpiringSoon = isPending && new Date(deal.expiresAt).getTime() - now < 60000;

  return (
    <div className="p2p-page">
      <div className="p2p-topbar">
      <button className="p2p-icon-btn" onClick={() => navigateP2P(navigate, "/p2p/deals")}><ChevronLeft /></button>
         <span className="p2p-title">Deal #{deal.id}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <span className={"p2p-badge-pill " + deal.status}>{deal.status.replace("_", " ").toUpperCase()}</span>
      </div>

      {isPending && (
        <>
          <div className="p2p-countdown" style={{ color: isExpiringSoon ? "#ff5c5c" : "#fff" }}>{formatCountdown(deal.expiresAt)}</div>
          <div className="p2p-countdown-label">Time remaining to complete this deal</div>
        </>
      )}

      <div className="p2p-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>Counterparty</span>
          <span style={{ fontWeight: 700 }}>{deal.counterpartyName}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>Asset</span>
          <span style={{ fontWeight: 700 }}>{deal.baseAmount.toFixed(6) + " " + deal.baseAsset}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>Amount</span>
          <span style={{ fontWeight: 700 }}>{"$" + deal.quoteAmountUsd.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>Rate</span>
          <span style={{ fontWeight: 700 }}>{"$" + deal.rateUsd.toLocaleString("en-US")}</span>
        </div>
        {deal.role === "poster" && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>Your commission</span>
            <span style={{ fontWeight: 700, color: "#ff8f8f" }}>{"-$" + deal.commissionUsd.toFixed(2)}</span>
          </div>
        )}
      </div>

      {statusMsg && <div className="p2p-status err">{statusMsg}</div>}

      {isPending && deal.role === "taker" && (
        <>
          <button className="p2p-primary-btn" disabled={isBusy} onClick={handleConfirm}>{isBusy ? "Processing..." : "Confirm Trade"}</button>
          <button className="p2p-secondary-btn" disabled={isBusy} onClick={handleCancel}>Cancel Deal</button>
        </>
      )}

      {isPending && deal.role === "poster" && (
        <>
          <div className="p2p-status ok">Waiting for the buyer to confirm this trade.</div>
          <button className="p2p-secondary-btn" disabled={isBusy} onClick={handleCancel}>Cancel Deal</button>
        </>
      )}

      {deal.status === "completed" && <div className="p2p-status ok">Trade completed successfully.</div>}
      {(deal.status === "cancelled" || deal.status === "expired") && <div className="p2p-status err">This deal did not complete.</div>}
    </div>
  );
};

export default P2PDealStatus;