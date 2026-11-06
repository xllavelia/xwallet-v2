// Общие утилиты, метаданные монет и иконки маркет-модуля

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

function IconBack() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
}

function IconSearch() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
}

function IconArrow() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="13 6 19 12 13 18"></polyline></svg>);
}

function IconChevron() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>);
}

function IconSwap() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>);
}

function IconBuy() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>);
}

function IconSell() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>);
}

function IconCard() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>);
}

function IconRefresh() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"></path><polyline points="21 3 21 9 15 9"></polyline></svg>);
}

function IconInfo() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="11" x2="12" y2="16"></line><line x1="12" y1="8" x2="12" y2="8.01"></line></svg>);
}

function IconSend() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>);
}

function IconChart() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 17 9 11 13 15 21 7"></polyline><polyline points="15 7 21 7 21 13"></polyline></svg>);
}

function IconHistory() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"></path><polyline points="3 4 3 9 8 9"></polyline><polyline points="12 7 12 12 15.5 14"></polyline></svg>);
}

function IconPlus() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
}

function IconChevronDown() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>);
}

function IconSwapVertical() {
  return (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 10 12 5 17 10"></polyline><line x1="12" y1="5" x2="12" y2="15"></line><polyline points="7 14 12 19 17 14"></polyline><line x1="12" y1="19" x2="12" y2="9"></line></svg>);
}

function IconCheck() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 12.5 10 17.5 19 7"></polyline></svg>);
}

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
