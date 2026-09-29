import React from "react";
import { useNavigate } from "react-router-dom";

// Пути — сверь с App.jsx. Если роут называется иначе, поправь только здесь.
var REWARDS_ROUTES = {
  vouchers: "/bonus",
  daily: "/rewards"
};
var GAMES_ROUTES = {
  empire: "/empire",
  pixel: "/pixel",
  rocket: "/rocket",
  flip: "/flip",
  ticket: "/ticket",
  trade: "/trade",
  slots: "/slots"

};

// ===================== ИКОНКИ =====================

function GiftIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"></path></svg>);
}
function TicketIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2 2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z"></path><path d="M14 7v10" strokeDasharray="2 3"></path></svg>);
}
function EmpireIcon() {
  return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="9" y1="6" x2="9.01" y2="6"></line><line x1="15" y1="6" x2="15.01" y2="6"></line><line x1="9" y1="10" x2="9.01" y2="10"></line><line x1="15" y1="10" x2="15.01" y2="10"></line><path d="M10 22v-4h4v4"></path></svg>);
}
function SlotsIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M8 5v14"></path><path d="M16 5v14"></path><path d="M8 12h.01"></path><path d="M12 12h.01"></path><path d="M16 12h.01"></path></svg>);
}
function PixelIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>);
}
function RocketIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>);
}
function FlipIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>);
}
function TradeIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>);
}
function CloseIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
}

// ===================== ОБЩАЯ КОРЗИНА МОДАЛКИ =====================

function PickerShell(props) {
  return (
    <div className="hmp-overlay" onClick={props.onClose}>
      <div className="hmp-card" onClick={(e) => e.stopPropagation()}>
        <div className="hmp-head">
          <div className="hmp-head-text">
            <span className="hmp-title">{props.title}</span>
            <span className="hmp-sub">{props.subtitle}</span>
          </div>
          <button className="hmp-close" onClick={props.onClose}><CloseIcon /></button>
        </div>
        {props.children}
      </div>
    </div>
  );
}

function Tile(props) {
  return (
    <button className={"hmp-tile" + (props.hero ? " hero" : "") + (props.tone ? " " + props.tone : "")} onClick={props.onGo}>
      {props.hero && <span className="hmp-shine"></span>}
      <span className="hmp-tile-icon">{props.icon}</span>
      <span className="hmp-tile-name">{props.name}</span>
      <span className="hmp-tile-desc">{props.desc}</span>
      <span className="hmp-tile-cta">{props.cta || "Open"} <span className="hmp-arrow"></span></span>
    </button>
  );
}

// ===================== МОДАЛКА: НАГРАДЫ =====================

export function RewardsPickerModal(props) {
  const navigate = useNavigate();

  function go(path) {
    props.onClose();
    navigate(path);
  }

  return (
    <PickerShell
      title="Rewards"
      subtitle="Pick what to check"
      onClose={props.onClose}
    >
      <div className="hmp-grid two">
        <Tile
          tone="gold"
          icon={<TicketIcon />}
          name="Vouchers"
          desc="Active and expired"
          onGo={() => go(REWARDS_ROUTES.vouchers)}
        />
        <Tile
          tone="green"
          icon={<GiftIcon />}
          name="Daily Rewards"
          desc="Claim today's drop"
          onGo={() => go(REWARDS_ROUTES.daily)}
        />
      </div>
    </PickerShell>
  );
}

// ===================== МОДАЛКА: МИНИ-ИГРЫ =====================

export function MiniGamesModal(props) {
  const navigate = useNavigate();

  function go(path) {
    props.onClose();
    navigate(path);
  }

  return (
    <PickerShell
      title="Mini Games"
      subtitle="Six ways to grow the balance"
      onClose={props.onClose}
    >
      {/* Empire — флагман: широкий hero-тайл с бегущим бликом, без кричащих бейджей */}
      {/* <Tile
        hero
        tone="empire"
        icon={<EmpireIcon />}
        name="Empire"
        desc="Build a financial empire — facilities, market, prestige"
        cta="Enter command"
        onGo={() => go(GAMES_ROUTES.empire)}
      /> */}
       <div className="hmp-grid two">
        <Tile tone="pink"   icon={<EmpireIcon />}name="Empire" desc="Build empire" onGo={() => go(GAMES_ROUTES.empire)} />
        <Tile tone="cyan" icon={<SlotsIcon />} name="Slots" desc="risk and money" onGo={() => go(GAMES_ROUTES.slots)} />
      </div>
      
      <div className="hmp-grid three">
        <Tile tone="violet" icon={<PixelIcon />} name="Pixel" desc="Tap & collect" onGo={() => go(GAMES_ROUTES.pixel)} />
        <Tile tone="orange" icon={<RocketIcon />} name="Rocket" desc="Fly & multiply" onGo={() => go(GAMES_ROUTES.rocket)} />
        <Tile tone="blue" icon={<FlipIcon />} name="Flip" desc="Coin decision" onGo={() => go(GAMES_ROUTES.flip)} />
      </div>
      <div className="hmp-grid two">
        <Tile tone="pink" icon={<TicketIcon />} name="Ticket" desc="Draw & win" onGo={() => go(GAMES_ROUTES.ticket)} />
        <Tile tone="cyan" icon={<TradeIcon />} name="Trade" desc="Charts & orders" onGo={() => go(GAMES_ROUTES.trade)} />
      </div>
      
    </PickerShell>
  );
}