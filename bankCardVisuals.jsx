import React from "react";

var TIER_COLORS = {
  standard: "#5a5a5a",
  classico: "#b5793e",
  cobalt: "#2f6fed",
  astro: "#8a4fe0",
  saint: "#f0b90b"
};

var TIER_NAMES = {
  standard: "Standard",
  classico: "Classico",
  cobalt: "Cobalt",
  astro: "Astro",
  saint: "Saint"
};

function MiniCardThumb(props) {
  var tier = props.tier;
  var color = TIER_COLORS[tier] || "#5a5a5a";
  var size = props.size || "md";
  return (
    <div className={"mct-thumb mct-" + size}>
      <div className="mct-dark">
        <span className="mct-num">{props.last4 ? "···· " + props.last4 : ""}</span>
      </div>
      <div className="mct-accent" style={{ background: color }}></div>
    </div>
  );
}

export { TIER_COLORS, TIER_NAMES, MiniCardThumb };