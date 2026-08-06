import React, { useState } from "react";
import CaseOpenModal from "./CaseOpenModal";

var RARITY_CONFIG = {
  epic: {
    name: "Epic", key: "epicCases",
    top: "$10-30 USDT · 1-5 LAVX",
    bottom: "2 random vouchers · 3% Lucky status"
  },
  mythic: {
    name: "Mythic", key: "mythicCases",
    top: "$20-100 USDT · 5-10 LAVX",
    bottom: "3 random vouchers · 3% Young status"
  },
  legendary: {
    name: "Legendary", key: "legendaryCases",
    top: "$50-200 USDT · 10-20 LAVX",
    bottom: "5 double vouchers · 3% Saint status"
  }
};

function XDrop(props) {
  var counts = props.counts || { epicCases: 0, mythicCases: 0, legendaryCases: 0 };
  var onOpened = props.onOpened;

  var [openingRarity, setOpeningRarity] = useState(null);

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

      <div className="xdrop-list">
        {["epic", "mythic", "legendary"].map(function (rarity) {
          var cfg = RARITY_CONFIG[rarity];
          var count = counts[cfg.key] || 0;
          var cardClass = "xdrop-card xdrop-" + rarity + (count <= 0 ? " xdrop-empty" : "");
          return (
            <div className={cardClass} key={rarity} onClick={() => handleTapCard(rarity)}>
              <div className="xdrop-glow"></div>
              {rarity === "legendary" && <div className="xdrop-shimmer"></div>}

              <div className="xdrop-row xdrop-row-top">{cfg.top}</div>

              <div className="xdrop-row xdrop-row-count">
                <span className="xdrop-x-mark">X</span>
                <div className="xdrop-count-block">
                  <span className="xdrop-count-num">{count}</span>
                  <span className="xdrop-count-label">AVAILABLE</span>
                </div>
                <span className="xdrop-rarity-tag">{cfg.name.toUpperCase()}</span>
              </div>

              <div className="xdrop-row xdrop-row-bottom">{cfg.bottom}</div>
              <div className="xdrop-row xdrop-row-cta">{count > 0 ? "TAP TO OPEN" : "NONE AVAILABLE"}</div>
            </div>
          );
        })}
      </div>

      {openingRarity && <CaseOpenModal rarity={openingRarity} onClose={handleModalClose} />}
    </div>
  );
}

export default XDrop;