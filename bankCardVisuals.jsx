import React from "react";

var TIER_COLORS = {
  standard: "#1c1c1c",
  classico: "#A7ADB5",
  cobalt: "#386BFF",
  astro: "#8B5CF6",
  saint: "#f5f797"
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