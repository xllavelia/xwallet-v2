import React from "react";

function Glyph(props) {
  var type = props.type;
  var c = { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" };

  if (type === "up") {
    return (<svg {...c}><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>);
  }
  if (type === "down") {
    return (<svg {...c}><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>);
  }
  if (type === "swap") {
    return (<svg {...c}><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>);
  }
  if (type === "gift") {
    return (<svg {...c}><path d="M3 8l9-4 9 4-9 4-9-4Z"></path><path d="M3 8v9l9 4 9-4V8"></path><line x1="12" y1="12" x2="12" y2="21"></line></svg>);
  }
  return null;
}

function formatGroupLabel(date) {
  var now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  var yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function groupByDate(rows) {
  var groups = [];
  var map = {};
  rows.forEach(function (row) {
    var d = new Date(row.dateRaw);
    var label = formatGroupLabel(d);
    if (!map[label]) {
      map[label] = { label: label, rows: [], sortTime: d.getTime() };
      groups.push(map[label]);
    }
    map[label].rows.push(row);
  });
  groups.forEach(function (g) {
    g.total = g.rows.reduce(function (acc, r) { return acc + (r.amountSigned || 0); }, 0);
  });
  groups.sort(function (a, b) { return b.sortTime - a.sortTime; });
  return groups;
}

export { Glyph, groupByDate };