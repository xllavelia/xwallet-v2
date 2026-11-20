// Общие утилиты, метаданные монет и иконки маркет-модуля

import { Icon } from "./icons";

var COIN_ORDER = ["BTC", "ETH", "SOL", "TON"];

var COIN_META = {
  BTC: { name: "Bitcoin", glyph: "\u20BF", color: "#f7931a" },
  ETH: { name: "Ethereum", glyph: "\u039E", color: "#8c8fee" },
  SOL: { name: "Solana", glyph: "\u25CE", color: "#14f195" },
  TON: { name: "Toncoin", glyph: "\u25C6", color: "#0098ea" }
};

function fmtUsd(value, digits) {
  var n = Number(value) || 0;
  var d = digits === undefined ? 2 : digits;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtPrice(value) {
  var n = Number(value) || 0;
  if (n >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return "$" + n.toFixed(2);
  return "$" + n.toFixed(4);
}

function fmtQty(value) {
  var n = Number(value) || 0;
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  var digits = n > 0 && n < 0.01 ? 6 : n > 0 && n < 1 ? 4 : 2;
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function signedUsd(value) {
  var n = Number(value) || 0;
  return (n >= 0 ? "+" : "\u2212") + fmtUsd(Math.abs(n));
}

function signedPct(value) {
  var n = Number(value) || 0;
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

function toneOf(value) {
  return (Number(value) || 0) >= 0 ? "pos" : "neg";
}

// Цвет линии графика тянем из CSS-переменной, чтобы акцент жил в одном месте
function readAccent() {
  var raw = getComputedStyle(document.documentElement).getPropertyValue("--xlavelia").trim();
  return raw || "#f4f2ec";
}

function alphaColor(color, alpha) {
  var value = String(color).trim();
  if (value.length === 4 && value.charAt(0) === "#") {
    value = "#" + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
  }
  if (value.length !== 7 || value.charAt(0) !== "#") return value;
  var r = parseInt(value.slice(1, 3), 16);
  var g = parseInt(value.slice(3, 5), 16);
  var b = parseInt(value.slice(5, 7), 16);
  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}

// Маркет-иконки — тонкие обёртки над общим набором, размеры остаются на месте.
function IconBack() { return <Icon name="back" size={18} />; }
function IconSearch() { return <Icon name="search" size={16} />; }
function IconArrow() { return <Icon name="arrow" size={14} />; }
function IconChevron() { return <Icon name="chevron" size={12} />; }
function IconSwap() { return <Icon name="swap" size={16} />; }
function IconBuy() { return <Icon name="arrow-up" size={16} />; }
function IconSell() { return <Icon name="arrow-down" size={16} />; }
function IconCard() { return <Icon name="card" size={13} />; }
function IconRefresh() { return <Icon name="refresh" size={14} />; }
function IconInfo() { return <Icon name="info" size={13} />; }
function IconSend() { return <Icon name="arrow-up" size={16} />; }
function IconChart() { return <Icon name="chart" size={16} />; }
function IconHistory() { return <Icon name="history" size={16} />; }
function IconPlus() { return <Icon name="plus" size={16} />; }
function IconChevronDown() { return <Icon name="chevron-down" size={12} />; }
function IconSwapVertical() { return <Icon name="swap-vertical" size={17} />; }
function IconCheck() { return <Icon name="check" size={16} />; }

export {
  COIN_ORDER,
  COIN_META,
  fmtUsd,
  fmtPrice,
  fmtQty,
  signedUsd,
  signedPct,
  toneOf,
  readAccent,
  alphaColor,
  IconBack,
  IconSearch,
  IconArrow,
  IconChevron,
  IconSwap,
  IconBuy,
  IconSell,
  IconCard,
  IconRefresh,
  IconInfo,
  IconSend,
  IconChart,
  IconHistory,
  IconPlus,
  IconChevronDown,
  IconSwapVertical,
  IconCheck
};
