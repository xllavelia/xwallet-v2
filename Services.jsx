import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { enterP2P } from "./p2pNav";
import { Icon } from "./icons";

var MODULES = [
  { name: "Trade", desc: "Live charts, long & short positions", path: "/trade" },
  { name: "Send", desc: "Send USDT to another player", path: "/send" },
  { name: "Empire", desc: "Build your financial empire", path: "/empire" },
  { name: "Slots", desc: "Three reels, one pull", path: "/slots" },
  { name: "Rocket", desc: "Crash-style multiplier game", path: "/rocket" },
  { name: "Pixel", desc: "Minefield multiplier game", path: "/pixel" },
  { name: "Flip", desc: "Red or black · 1.90x payout", path: "/flip" },
  { name: "Ticket", desc: "Scratch card and buy", path: "/ticket" },
  { name: "Rewards", desc: "Get daily rewards and bonuses", path: "/rewards" },
  { name: "Mining", desc: "Create a mining farm and earn money", path: "/mining" },
  { name: "Crypto", desc: "Swap, buy and sell four coins", path: "/crypto" },
  { name: "Markets", desc: "Stocks & resources trading", path: "/markets" },
  { name: "Savings Account", desc: "12% APY, deposit anytime", path: "/savings" },
  { name: "History", desc: "Trades, transfers & card activity", path: "/history" },
  { name: "Vouchers", desc: "Fee discounts, USDT & LAVX credits", path: "/bonus" },
  { name: "Community", desc: "News, friends, leaders & referrals", path: "/community" },
  { name: "Battle Pass", desc: "Season rewards, looks & cases", path: "/battlepass" },
  { name: "NFT", desc: "Collect, earn hourly & trade NFTs", path: "/nft" },
  { name: "Prime", desc: "Membership tiers & LAVX", path: "/prime" },
  { name: "Promo Code", desc: "Redeem a code", path: "/promocode" },
  { name: "Profile", desc: "Your identity, appearance & settings", path: "/profile" },
  { name: "Accounts", desc: "Open accounts and manage your money", path: "/balancecard" },
  { name: "P2P Market", desc: "Trade directly with other users", path: "/p2p" },
];

const Services = () => {
  const navigate = useNavigate();
  var [query, setQuery] = useState("");

  var filtered = MODULES.filter(function (m) {
    var q = query.trim().toLowerCase();
    if (q.length === 0) return true;
    return m.name.toLowerCase().indexOf(q) !== -1 || m.desc.toLowerCase().indexOf(q) !== -1;
  });

function road(path) { navigate(-1); setTimeout(() => { if (path === "/p2p") { enterP2P(navigate); } else { navigate(path); } }, 20); }
  
  return (
    <div className="ServicesContent">
      <div className="svc-page">
        <div className="svc-header">
          <span className="svc-eyebrow">Explore</span>
          <h1 className="svc-title">Services</h1>
        </div>

        <div className="svc-search-bar">
          <Icon name="search" size={18} />
          <input className="svc-search-input" placeholder="Search modules and features" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="svc-grid">
          {filtered.map(function (m) {
            return (
          <div className="svc-tile" key={m.path} onClick={() => road(m.path)}>
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