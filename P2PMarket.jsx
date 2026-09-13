import React from "react";
import { useNavigate } from "react-router-dom";
import { useMerchantStatus, useMyDeals } from "./useP2P";
import { backFromP2PHub, goToP2PModule } from "./p2pNav";
import { backToP2PMarket } from "./p2pNav";

function ChevronLeft() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>); }
function DownArrowIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>); }
function UpArrowIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>); }
function StorefrontIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-5h16l1 5"></path><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"></path><path d="M4 9v10h16V9"></path></svg>); }
function ListIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>); }
function BellIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>); }
function HelpIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>); }

const P2PMarket = () => {
  const navigate = useNavigate();
  var { status } = useMerchantStatus();
  var { deals: activeDeals } = useMyDeals(true);

  return (
    <div className="p2p-page">
      <div className="p2p-topbar">
        <button className="p2p-icon-btn" onClick={() => backFromP2PHub(navigate)}><ChevronLeft /></button>
        <span className="p2p-title">P2P Market</span>
      </div>

      <div className="p2p-header">
        <span className="p2p-eyebrow">Trade directly</span>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Exchange assets directly with other xWallet users
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="p2p-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => goToP2PModule(navigate, "/p2pbrowse", { side: "buy" })}>
          <DownArrowIcon />
          <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 13, fontWeight: 800 }}>Buy</span>
        </div>
        <div className="p2p-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => goToP2PModule(navigate, "/p2pbrowse", { side: "sell" })}>
          <UpArrowIcon />
          <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 13, fontWeight: 800 }}>Sell</span>
        </div>
      </div>

      <div className="p2p-card" onClick={() => goToP2PModule(navigate, "/p2pmerchant")} style={{ cursor: "pointer" }}>
        <div className="p2p-menu-row" style={{ padding: 0 }}>
          <div className="p2p-menu-icon"><StorefrontIcon /></div>
          <div className="p2p-menu-text">
            <span className="p2p-menu-title">{status && status.isMerchant ? "Merchant Dashboard" : "Become a Merchant"}</span>
            <span className="p2p-menu-sub">{status && status.isMerchant ? (status.totalDeals + " deals · " + status.successRate.toFixed(0) + "% success") : "Earn from P2P trading"}</span>
          </div>
          <span className="p2p-menu-chevron">›</span>
        </div>
      </div>

      <div className="p2p-card" style={{ display: "flex", flexDirection: "column", gap: 4, padding: 6 }}>
        <div className="p2p-menu-row" onClick={() => goToP2PModule(navigate, "/p2pdeals")}>
          <div className="p2p-menu-icon"><ListIcon /></div>
          <div className="p2p-menu-text">
            <span className="p2p-menu-title">My Deals</span>
            <span className="p2p-menu-sub">{activeDeals.length > 0 ? (activeDeals.length + " active") : "No active deals"}</span>
          </div>
          <span className="p2p-menu-chevron">›</span>
        </div>
        <div className="p2p-menu-row">
          <div className="p2p-menu-icon"><BellIcon /></div>
          <div className="p2p-menu-text"><span className="p2p-menu-title">Notifications</span></div>
          <span className="p2p-menu-chevron">›</span>
        </div>
        <div className="p2p-menu-row">
          <div className="p2p-menu-icon"><HelpIcon /></div>
          <div className="p2p-menu-text"><span className="p2p-menu-title">FAQ</span></div>
          <span className="p2p-menu-chevron">›</span>
        </div>
      </div>
    </div>
  );
};

export default P2PMarket;