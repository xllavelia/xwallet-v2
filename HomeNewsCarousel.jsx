import React, { useRef, useState } from "react";

var NEWS_ITEMS = [
  {
    title: "Send to Any Card",
    text: "Transfer USDT straight to any xWallet card by number — no need to look up a Player ID.",
    accent: "#f0b90b"
  },
  {
    title: "Open Your First Card",
    text: "Standard is free forever. Upgrade to Classico, Cobalt, Astro or Saint for cashback, lower fees and monthly LAVX.",
    accent: "#2f6fed"
  },
  {
    title: "Trade Real Stocks",
    text: "Buy and sell shares in 20 of the world's biggest tech companies, funded straight from your active card.",
    accent: "#8a4fe0"
  },
  {
    title: "P2P Market Is Live",
    text: "Trade crypto, stocks, USD and LAVX directly with other users. Become a merchant and list your own offers.",
    accent: "#00d4aa"
  }
];

function ArrowIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);
}

function HomeNewsCarousel() {
  var trackRef = useRef(null);
  var [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    var el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    var idx = Math.round(el.scrollLeft / (el.clientWidth * 0.86));
    if (idx !== activeIndex) setActiveIndex(idx);
  }

  return (
    <div className="hnc-wrap">
      <div className="hnc-track" ref={trackRef} onScroll={handleScroll}>
        {NEWS_ITEMS.map(function (item, idx) {
          return (
            <div className="hnc-card" key={idx}>
              <div className="hnc-card-glow" style={{ background: item.accent }}></div>
              <h4 className="hnc-card-title">{item.title}</h4>
              <p className="hnc-card-text">{item.text}</p>
              <div className="hnc-card-arrow" style={{ color: item.accent }}><ArrowIcon /></div>
            </div>
          );
        })}
      </div>
      <div className="hnc-dots">
        {NEWS_ITEMS.map(function (_, idx) {
          return <span key={idx} className={"hnc-dot" + (idx === activeIndex ? " active" : "")}></span>;
        })}
      </div>
    </div>
  );
}

export default HomeNewsCarousel;