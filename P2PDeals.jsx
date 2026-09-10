import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyDeals } from "./useP2P";

function ChevronLeft() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>); }

const P2PDeals = () => {
  const navigate = useNavigate();
  var [activeTab, setActiveTab] = useState("active");
  var { deals } = useMyDeals(activeTab === "active");

  return (
    <div className="p2p-page">
      <div className="p2p-topbar">
        <button className="p2p-icon-btn" onClick={() => navigate(-1)}><ChevronLeft /></button>
        <span className="p2p-title">My Deals</span>
      </div>

      <div className="p2p-toggle">
        <div className={"p2p-toggle-pill " + (activeTab === "history" ? "right" : "")}></div>
        <button className={"p2p-toggle-btn " + (activeTab === "active" ? "active" : "")} onClick={() => setActiveTab("active")}>Active</button>
        <button className={"p2p-toggle-btn " + (activeTab === "history" ? "active" : "")} onClick={() => setActiveTab("history")}>History</button>
      </div>

      {deals.length === 0 && (
        <div className="p2p-empty">
          <span className="p2p-empty-title">No deals here</span>
          <span className="p2p-empty-sub">{activeTab === "active" ? "Start a trade from the market" : "Your completed deals will appear here"}</span>
        </div>
      )}

      {deals.map(function (d) {
        return (
          <div className="p2p-listing-row" key={d.id} onClick={() => navigate("/p2p/deal", { state: { dealId: d.id } })}>
            <div className="p2p-listing-top">
              <span className="p2p-listing-rate" style={{ fontSize: 16 }}>{d.baseAmount.toFixed(6) + " " + d.baseAsset}</span>
              <span className={"p2p-badge-pill " + d.status}>{d.status.replace("_", " ").toUpperCase()}</span>
            </div>
            <div className="p2p-listing-meta">
              <span>{"With " + d.counterpartyName}</span>
              <span>{"$" + d.quoteAmountUsd.toFixed(2)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default P2PDeals;