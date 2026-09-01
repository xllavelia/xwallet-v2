import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

var MODULES = [
  { name: "Trade", desc: "Live charts, long & short positions", path: "/trade" },
  { name: "Send", desc: "Send USDT to another player", path: "/send" },
  { name: "Crypto Card", desc: "BTC, ETH, SOL, TON balances & swap", path: "/card" },
  { name: "Savings Account", desc: "12% APY, deposit anytime", path: "/savings" },
  { name: "History", desc: "Trades, transfers & card activity", path: "/history" },
  { name: "Vouchers", desc: "Fee discounts, USDT & LAVX credits", path: "/bonus" },
  { name: "Referrals", desc: "Invite friends, earn commission", path: "/referral" },
  { name: "Battle Pass", desc: "Season rewards & XDrop cases", path: "/battlepass" },
  { name: "Prime", desc: "Membership tiers & LAVX", path: "/prime" },
  { name: "Promo Code", desc: "Redeem a code", path: "/promocode" },
  { name: "Profile", desc: "Account, security, settings", path: "/profile" }
];

function SearchIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
}

const Services = () => {
  const navigate = useNavigate();
  var [query, setQuery] = useState("");

  var filtered = MODULES.filter(function (m) {
    var q = query.trim().toLowerCase();
    if (q.length === 0) return true;
    return m.name.toLowerCase().indexOf(q) !== -1 || m.desc.toLowerCase().indexOf(q) !== -1;
  });

  return (
    <div className="ServicesContent">
      <div className="svc-page">
        <div className="svc-header">
          <span className="svc-eyebrow">Explore</span>
          <h1 className="svc-title">Services</h1>
        </div>

        <div className="svc-search-bar">
          <SearchIcon />
          <input className="svc-search-input" placeholder="Search modules and features" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="svc-grid">
          {filtered.map(function (m) {
            return (
              <div className="svc-tile" key={m.path} onClick={() => navigate(m.path)}>
                <span className="svc-tile-name">{m.name}</span>
                <span className="svc-tile-desc">{m.desc}</span>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="svc-empty">{"No results for \u201C" + query + "\u201D"}</div>}
        </div>
      </div>
    </div>
  );
};

export default Services;