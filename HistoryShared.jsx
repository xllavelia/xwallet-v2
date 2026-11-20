import React from "react";
import { Icon } from "./icons";

// Общие примитивы истории: иконки строк и группировка по датам.

var GLYPH_NAMES = { up: "arrow-up", down: "arrow-down", swap: "swap", gift: "box" };

function Glyph(props) {
  var name = GLYPH_NAMES[props.type];
  return name ? <Icon name={name} size={16} /> : null;
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
  var groups = [], map = {};
  rows.forEach(function (row) {
    var d = row.dateRaw ? new Date(row.dateRaw) : null;
    var valid = d && !isNaN(d.getTime());
    var label = valid ? formatGroupLabel(d) : "All time";
    if (!map[label]) {
      map[label] = { label: label, rows: [], sortTime: valid ? d.getTime() : -1 };
      groups.push(map[label]);
    }
    map[label].rows.push(row);
  });
  groups.forEach(function (g) {
    g.total = g.rows.reduce(function (acc, r) { return acc + (r.amountSigned || 0); }, 0);
    g.hasMoney = g.rows.some(function (r) { return (r.amountSigned || 0) !== 0; });
  });
  groups.sort(function (a, b) { return b.sortTime - a.sortTime; });
  return groups;
}

export { Glyph, groupByDate };