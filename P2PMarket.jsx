import React from "react";
import { useNavigate } from "react-router-dom";
import { useMerchantStatus, useMyDeals } from "./useP2P";
import { backFromP2PHub, goToP2PModule } from "./p2pNav";
import { backToP2PMarket } from "./p2pNav";
import { Icon } from "./icons";

function ChevronLeft() { return <Icon name="back" size={20} />; }
function DownArrowIcon() { return <Icon name="arrow-down" size={18} />; }
function UpArrowIcon() { return <Icon name="arrow-up" size={18} />; }
function StorefrontIcon() { return <Icon name="store" size={18} />; }
function ListIcon() { return <Icon name="list" size={18} />; }
function BellIcon() { return <Icon name="bell" size={18} />; }
function HelpIcon() { return <Icon name="help" size={18} />; }

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