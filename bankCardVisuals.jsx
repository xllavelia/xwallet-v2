import React from "react";

var TIER_COLORS = {
  standard: "#484848",
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

function CardPattern(props) {
  var seed = props.seed || "diagonal";
  var color = props.color || "#fff";

  if (seed === "waves") {
    return (
      <svg className="cpat" viewBox="0 0 200 120" preserveAspectRatio="none">
        <path d="M0 30 Q50 10 100 30 T200 30" stroke={color} strokeWidth="1.5" fill="none" opacity="0.15" />
        <path d="M0 60 Q50 40 100 60 T200 60" stroke={color} strokeWidth="1.5" fill="none" opacity="0.12" />
        <path d="M0 90 Q50 70 100 90 T200 90" stroke={color} strokeWidth="1.5" fill="none" opacity="0.1" />
      </svg>
    );
  }
  if (seed === "dots") {
    var dots = [];
    for (var y = 0; y < 6; y++) {
      for (var x = 0; x < 10; x++) {
        dots.push(<circle key={x + "-" + y} cx={x * 22 + 10} cy={y * 22 + 10} r="1.6" fill={color} opacity="0.14" />);
      }
    }
    return <svg className="cpat" viewBox="0 0 200 120" preserveAspectRatio="none">{dots}</svg>;
  }
  if (seed === "stars") {
    return (
      <svg className="cpat" viewBox="0 0 200 120" preserveAspectRatio="none">
        {[[20,20],[70,15],[130,25],[170,50],[40,60],[100,70],[160,90],[30,95],[90,100]].map(function (p, i) {
          return <path key={i} d={"M" + p[0] + " " + (p[1]-6) + " l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"} fill={color} opacity="0.16" />;
        })}
      </svg>
    );
  }
  if (seed === "grid") {
    return (
      <svg className="cpat" viewBox="0 0 200 120" preserveAspectRatio="none">
        {[0,1,2,3,4,5].map(function (i) { return <line key={"h"+i} x1="0" y1={i*24} x2="200" y2={i*24} stroke={color} strokeWidth="1" opacity="0.08" />; })}
        {[0,1,2,3,4,5,6,7,8].map(function (i) { return <line key={"v"+i} x1={i*24} y1="0" x2={i*24} y2="120" stroke={color} strokeWidth="1" opacity="0.08" />; })}
      </svg>
    );
  }
  // "diagonal" default
  return (
    <svg className="cpat" viewBox="0 0 200 120" preserveAspectRatio="none">
      {[0,1,2,3,4,5,6].map(function (i) {
        return <line key={i} x1={i * 32 - 20} y1="130" x2={i * 32 + 30} y2="-10" stroke={color} strokeWidth="6" opacity="0.08" strokeLinecap="round" />;
      })}
    </svg>
  );
}


function MiniCardThumb(props) {
  var size = props.size || "md";

  return (
    <div className={"mct-thumb mct-" + size}>
      <div className="mct-dark">
        <div className="mct-art" />

 {/* <span className="mct-brand-plus">X</span> */}
        <span className="mct-brand">
          XW
        </span>

        <span className="mct-num">
          {props.last4 ? "•••• " + props.last4 : ""}
        </span>
      </div>
    </div>
  );
}


export { TIER_COLORS, TIER_NAMES, MiniCardThumb, CardPattern };