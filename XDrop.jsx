import React, { useState, useRef } from "react";
import CaseOpenModal from "./CaseOpenModal";

var RARITY_CONFIG = {
  classico: {
    name: "classico", key: "classicoCases", index: "01", label: "classico tier",
    description: "A solid drop with fair odds and steady rewards.",
    features: [
      "$10 – $30 USDT drop",
      "2 random vouchers (up to 25 Ref XP or $50 fee-free)",
      "1 – 5 LAVX",
      "3% chance of Lucky status"
    ]
  },
  elysium: {
    name: "elysium", key: "elysiumCases", index: "02", label: "most valuable",
    description: "Bigger rolls across the board — the fan favorite.",
    features: [
      "$20 – $100 USDT drop",
      "3 random vouchers (up to 35 Ref XP or $100 fee-free)",
      "5 – 10 LAVX",
      "3% chance of Young status"
    ]
  },
  legendary: {
    name: "Legendary", key: "legendaryCases", index: "03", label: "top tier",
    description: "The rarest case — every voucher rolls in a matched pair.",
    features: [
      "$50 – $200 USDT drop",
      "5 double vouchers (Ref XP + fee-free together)",
      "10 – 20 LAVX",
      "3% chance of Saint status"
    ]
  }
};

function XDrop(props) {
  var counts = props.counts || { classicoCases: 0, elysiumCases: 0, legendaryCases: 0 };
  var onOpened = props.onOpened;

  var [openingRarity, setOpeningRarity] = useState(null);
  var carouselRef = useRef(null);

  function handleTapCard(rarity) {
    var count = counts[RARITY_CONFIG[rarity].key] || 0;
    if (count <= 0) return;
    setOpeningRarity(rarity);
  }

  function handleModalClose() {
    setOpeningRarity(null);
    if (onOpened) onOpened();
  }

  return (
    <div className="xdrop-section">
      <div className="xdrop-header">
        <span className="xdrop-eyebrow">Inventory</span>
        <h2 className="xdrop-title">XDrop</h2>
      </div>

      <div className="xdrop-carousel" ref={carouselRef}>
        {["classico", "elysium", "legendary"].map(function (rarity) {
          var cfg = RARITY_CONFIG[rarity];
          var count = counts[cfg.key] || 0;
          var hasCount = count > 0;
          var cardClass = "xdrop-price-card xdrop-" + rarity +
            (rarity === "elysium" ? " xdrop-price-card-featured" : "") +
            (hasCount ? "" : " xdrop-price-card-empty");

          return (
            <article className={cardClass} key={rarity}>
              <div className="xdrop-glow"></div>
              {rarity === "legendary" && <div className="xdrop-shimmer"></div>}

              <div className="ads-price-top">
                <span className="ads-price-label">{cfg.label}</span>
                <span className="ads-price-index">{cfg.index}</span>
              </div>

              <h3>{cfg.name}</h3>

              <div className="ads-price">
                <strong>{"×" + count}</strong>
                <span>/ available</span>
              </div>

              <p>{cfg.description}</p>

              <ul>
                {cfg.features.map(function (feature, i) {
                  return <li key={i}>{feature}</li>;
                })}
              </ul>

              <button disabled={!hasCount} onClick={() => handleTapCard(rarity)}>
                {hasCount ? "open case" : "none available"}
              </button>
            </article>
          );
        })}
      </div>

      {openingRarity && <CaseOpenModal rarity={openingRarity} onClose={handleModalClose} />}
    </div>
  );
}

export default XDrop;