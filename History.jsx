import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { closePosition } from "./usePositions";
import { Glyph } from "./HistoryShared";
import { authFetch } from "./apiClient";
import { AssetLogo } from "./AssetLogos";

const ENDPOINTS = {
  activity: "/history/activity", positions: "/positions/open-list",
  closed: "/positions/closed-list", transfers: "/transfers/list",
  crypto: "/card/history", savings: "/savings", tickets: "/ticket/state",
  slots: "/slots/state", rocket: "/rocket/state", flip: "/flip/state",
  pixel: "/pixel/state", mining: "/mining/state"
};
const SOURCES = {
  all: "All", trades: "Trades", transfers: "Transfers", crypto: "Crypto",
  markets: "Markets", tickets: "Tickets", games: "Games", daily: "Daily",
  battlepass: "Battle Pass", cases: "Cases", quests: "Quests",
  savings: "Savings", cashback: "Cashback", promo: "Vouchers", mining: "Mining"
};
const REQUIRED = ["activity", "positions", "closed", "transfers", "crypto", "savings"];
const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const money = value => "$" + Math.abs(num(value)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signedMoney = value => (num(value) < 0 ? "-" : "+") + money(value);
const fmtNum = value => num(value).toLocaleString("en-US", { maximumFractionDigits: 6 });
const toneOf = value => num(value) > 0 ? "pos" : num(value) < 0 ? "neg" : "neutral";
const sourceLabel = key => SOURCES[key] || key;
function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatDate(value) {
  const date = toDate(value);
  return date ? date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
}
function duration(start, end) {
  const seconds = Math.floor((new Date(end) - new Date(start)) / 1000);
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds >= 3600) return Math.floor(seconds / 3600) + "h " + Math.floor(seconds % 3600 / 60) + "m";
  return Math.floor(seconds / 60) + "m " + seconds % 60 + "s";
}
function amountText(event) {
  if (event.asset === "USD" || event.asset === "USDT") return signedMoney(event.amount);
  if (event.asset === "voucher") return money(event.amount) + " voucher";
  if (event.asset === "cosmetic") return event.facts?.find(row => row.label === "Reward")?.value || "Profile look";
  if (event.asset === "case" || event.asset === "status") return event.asset === "case" ? "Case" : "Status";
  return (event.amount > 0 ? "+" : "") + fmtNum(event.amount) + " " + event.asset;
}
const isCash = event => event.asset === "USD" || event.asset === "USDT";
const fact = (label, value, tone) => ({ label, value, tone });

function useHistoryData() {
  const [state, setState] = useState({ data: null, errors: [], loading: true });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const results = await Promise.all(Object.entries(ENDPOINTS).map(async ([key, path]) => {
        try { return { key, value: await authFetch(path) }; }
        catch { return { key, failed: true }; }
      }));
      if (!alive) return;
      const data = {}, errors = [];
      results.forEach(result => {
        if (result.failed) errors.push(result.key);
        else data[result.key] = result.value;
      });
      if (!data.activity || !Array.isArray(data.activity.events) || !Array.isArray(data.activity.ticketPacks)) {
        if (!errors.includes("activity")) errors.push("activity");
        delete data.activity;
      }
      setState({ data, errors, loading: false });
    };
    load();
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [revision]);
  return { ...state, refresh: () => setRevision(value => value + 1) };
}

function tradeEvent(item, livePrice) {
  const live = livePrice !== undefined;
  const entry = num(item.entryPrice), margin = num(item.margin);
  const pnl = live ? (entry > 0 && livePrice > 0 ? margin * num(item.leverage) * (livePrice - entry) / entry * (item.type === "short" ? -1 : 1) : 0) : num(item.pnl);
  const roi = margin > 0 ? pnl / margin * 100 : 0;
  const facts = [
    fact("Entry price", money(entry)),
    fact(live ? "Mark price" : "Close price", live ? (livePrice > 0 ? money(livePrice) : "—") : money(item.closePrice)),
    fact("Liq. price", money(item.liqPrice), "neg"),
    fact("Leverage", num(item.leverage) + "x"),
    fact("Position size", money(item.amount)), fact("Margin used", money(margin)),
    fact("Fees", item.feesPaidByVoucher ? "Covered by voucher" : money(item.fees)),
    fact("ROI", (roi >= 0 ? "+" : "") + roi.toFixed(2) + "%", toneOf(roi))
  ];
  if (!live) facts.push(fact("Duration", duration(item.openedAt, item.closedAt)));
  if (item.tradeMode === "time") facts.push(fact("Payout multiplier", num(item.payoutMultiplier).toFixed(2) + "x"));
  if (item.tradeId) facts.push(fact("Trade ID", item.tradeId));
  if (num(item.xpAwarded)) facts.push(fact("Battle Pass XP", "+" + fmtNum(item.xpAwarded)));
  if (num(item.cashbackAwarded)) facts.push(fact("Cashback", signedMoney(item.cashbackAwarded), "pos"));
  return {
    id: (live ? "live:" : "trade:") + item.id, source: "trades", kind: live ? "position" : "pnl",
    title: item.coin, badge: String(item.type || "long").toUpperCase(),
    status: live ? "LIVE" : pnl >= 0 ? "WIN" : "LOSS", amount: pnl, asset: "USD",
    at: live ? item.openedAt : item.closedAt, live, position: item,
    subtitle: live ? "Unrealized P&L" : "Realized P&L",
    secondary: (roi >= 0 ? "+" : "") + roi.toFixed(2) + "%",
    facts, timeline: [fact("Opened", formatDate(item.openedAt)), ...(!live ? [fact("Closed", formatDate(item.closedAt))] : [])]
  };
}

function buildActivity(data) {
  if (!data) return [];
  const events = [...((data.activity && data.activity.events) || [])];
  (data.closed || []).forEach(item => {
    events.push(tradeEvent(item));
    if (num(item.cashbackAwarded) > 0) events.push({
      id: "cashback:" + item.id, source: "cashback", kind: "credit", title: item.coin + " cashback",
      amount: num(item.cashbackAwarded), asset: "USD", at: item.closedAt,
      facts: [fact("Trade ID", item.tradeId || String(item.id))]
    });
  });
  (data.transfers || []).forEach(item => {
    const sent = item.direction === "send";
    events.push({
      id: "transfer:" + item.id, source: "transfers", kind: sent ? "send" : "receive",
      title: (sent ? "To " : "From ") + item.counterparty,
      amount: num(item.amount) * (sent ? -1 : 1), asset: "USD", at: item.createdAt,
      facts: [fact("Counterparty", item.counterparty), fact("Amount", money(item.amount)), fact("Transfer ID", String(item.id))]
    });
  });
  (data.crypto || []).forEach(item => {
    const buying = item.operationType === "buy", selling = item.operationType === "sell";
    events.push({
      id: "crypto:" + item.id, source: "crypto", kind: item.operationType,
      title: buying ? "Bought " + item.toAsset : selling ? "Sold " + item.fromAsset : item.fromAsset + " → " + item.toAsset,
      amount: buying ? -num(item.fromAmount) : num(item.toAmount), asset: buying || selling ? "USD" : item.toAsset,
      at: item.createdAt,
      facts: [fact("From", fmtNum(item.fromAmount) + " " + item.fromAsset), fact("To", fmtNum(item.toAmount) + " " + item.toAsset), fact("Price", money(item.price)), fact("Operation ID", String(item.id))]
    });
  });
  ((data.savings && data.savings.history) || []).forEach(item => {
    const interest = item.entryType === "interest", withdrawal = item.entryType === "withdrawal";
    events.push({
      id: "savings:" + item.id, source: "savings", kind: item.entryType,
      title: interest ? "Interest earned" : withdrawal ? "Savings withdrawal" : "Savings deposit",
      amount: num(item.amount) * (withdrawal ? 1 : interest ? 1 : -1), asset: "USD", at: item.createdAt,
      internal: !interest,
      facts: [fact("Account", "Savings"), fact("Type", interest ? "Interest" : "Internal transfer"), fact("Amount", money(item.amount))]
    });
  });
  const unique = new Map();
  events.forEach(event => unique.set(event.id, event));
  return [...unique.values()].sort((a, b) => (toDate(b.at)?.getTime() || 0) - (toDate(a.at)?.getTime() || 0));
}

// Только датированные USD-события; XP, ваучеры и внутренние переводы не являются доходом.
function buildMonthFlow(events, now = new Date()) {
  const year = now.getFullYear(), month = now.getMonth();
  const start = new Date(year, month, 1).getTime(), end = new Date(year, month + 1, 1).getTime();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: totalDays }, (_, index) => ({ day: index + 1, in: 0, out: 0, events: [] }));
  const inMap = {}, outMap = {};
  events.forEach(event => {
    const date = toDate(event.at);
    if (!isCash(event) || event.internal || event.live || !date || date.getTime() < start || date.getTime() >= end || !num(event.amount)) return;
    const dir = event.amount > 0 ? "in" : "out", amount = Math.abs(num(event.amount));
    days[date.getDate() - 1][dir] += amount;
    days[date.getDate() - 1].events.push({ ...event, dir, amount });
    const map = dir === "in" ? inMap : outMap;
    map[event.source] = (map[event.source] || 0) + amount;
  });
  const list = (map, dir) => Object.entries(map).map(([key, amount]) => ({ key, amount, dir, label: sourceLabel(key) })).sort((a, b) => b.amount - a.amount);
  const inTotal = days.reduce((total, day) => total + day.in, 0), outTotal = days.reduce((total, day) => total + day.out, 0);
  return { month: now, monthLabel: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }), totalDays, days, inTotal, outTotal, net: inTotal - outTotal, inSources: list(inMap, "in"), outSources: list(outMap, "out") };
}
function groupEvents(events) {
  const groups = new Map(), today = new Date(), yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  events.forEach(event => {
    const date = toDate(event.at), key = event.live ? "live" : date ? date.toDateString() : "summary";
    const label = event.live ? "Live positions" : !date ? "All-time summary" : key === today.toDateString() ? "Today" : key === yesterday.toDateString() ? "Yesterday" : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    if (!groups.has(key)) groups.set(key, { key, label, time: event.live ? Infinity : date ? date.getTime() : -Infinity, events: [] });
    groups.get(key).events.push(event);
  });
  return [...groups.values()].sort((a, b) => b.time - a.time);
}

function DialogFrame({ title, chart = false, onClose, children }) {
  const ref = useRef(null), closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement, overflow = document.body.style.overflow;
    const root = document.getElementById("root"), wasInert = root?.inert;
    if (root) root.inert = true;
    document.body.style.overflow = "hidden";
    ref.current.querySelector("button")?.focus();
    const onKey = event => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); }
      if (event.key !== "Tab") return;
      const buttons = [...ref.current.querySelectorAll("button:not(:disabled), a[href], [tabindex='0']")];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      if (root) root.inert = wasInert;
      document.removeEventListener("keydown", onKey);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return createPortal(
    <div className={"hm-overlay" + (chart ? "" : " hm-overlay-detail")} onClick={onClose}>
      <div ref={ref} className={"hm-modal " + (chart ? "hm-modal-chart" : "hm-modal-detail")} role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
        <span className="hm-grab" aria-hidden="true"></span>{children}
      </div>
    </div>, document.body
  );
}
function DetailOverlay({ event, onClose, onNavigate, onPositionClose }) {
  const cash = isCash(event), tone = cash ? toneOf(event.amount) : "neutral";
  const timeline = event.timeline || (event.at ? [fact("Date", formatDate(event.at))] : []);
  return (
    <DialogFrame title={event.title} onClose={onClose}>
      <div className="hm-head">
        <span className="hm-kicker">{event.badge || sourceLabel(event.source)}</span>
        <h2 className="hm-title">{event.title}</h2>
        {event.status ? <span className={"hm-chip " + tone}>{event.status}</span> : null}
        <button type="button" className="hm-close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <div className={"hm-hero " + tone}>
        <div className="hm-result"><strong className={"hm-hero-value" + (!cash ? " is-text" : "")}>{event.display || amountText(event)}</strong>{event.secondary ? <span className="hm-hero-meta">{event.secondary}</span> : null}</div>
        {event.subtitle ? <span className="hm-hero-kicker">{event.subtitle}</span> : null}
      </div>
      <div className="hm-facts">
        {(event.facts || []).map((row, index) => <div className="hm-fact" key={row.label + index}><span className="hm-fact-label">{row.label}</span><span className={"hm-fact-value " + (row.tone || "")}>{row.value}</span></div>)}
        {event.internal && event.kind !== "summary" ? <div className="hm-fact"><span className="hm-fact-label">Monthly totals</span><span className="hm-fact-value">Not counted · internal transfer</span></div> : null}
        {!cash && event.asset === "voucher" ? <div className="hm-fact"><span className="hm-fact-label">Cash received</span><span className="hm-fact-value">Counted only on redemption</span></div> : null}
      </div>
      {timeline.length ? <div className="hm-timeline">{timeline.map((row, index) => <div className="hm-fact" key={row.label + index}><span className="hm-fact-label">{row.label}</span><span className="hm-fact-value">{row.value}</span></div>)}</div> : null}
      {event.nav || event.live ? <div className="hm-foot">
        {event.nav ? <button type="button" className="hm-btn hm-btn-ghost" onClick={() => onNavigate(event.nav)}>Open {sourceLabel(event.source)}</button> : null}
        {event.live ? <><button type="button" className="hm-btn hm-btn-ghost" onClick={() => onNavigate({ path: "/trade", state: { coin: event.title } })}>Chart</button><button type="button" className="hm-btn hm-btn-danger" disabled={!event.markPrice} onClick={() => onPositionClose(event)}>Close position</button></> : null}
      </div> : null}
    </DialogFrame>
  );
}
function shortMoney(value) {
  const n = num(value), abs = Math.abs(n), sign = n < 0 ? "-" : "";
  return abs >= 1000 ? sign + "$" + (abs / 1000).toFixed(abs >= 10000 ? 0 : 1) + "k" : sign + "$" + Math.round(abs);
}
function smoothCurve(points) {
  if (!points.length) return "";
  let path = "M" + points[0].x.toFixed(2) + " " + points[0].y.toFixed(2);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i], p1 = points[i], p2 = points[i + 1], p3 = points[i + 2] || p2;
    path += " C" + (p1.x + (p2.x - p0.x) / 6).toFixed(2) + " " + (p1.y + (p2.y - p0.y) / 6).toFixed(2) + " " + (p2.x - (p3.x - p1.x) / 6).toFixed(2) + " " + (p2.y - (p3.y - p1.y) / 6).toFixed(2) + " " + p2.x.toFixed(2) + " " + p2.y.toFixed(2);
  }
  return path;
}
function FlowOverlay({ flow, initialMode, onClose, onSelect, coverage }) {
  const [mode, setMode] = useState(initialMode), [day, setDay] = useState(null);
  const activeDay = day ? flow.days[day - 1] : null;
  const sources = mode === "out" ? flow.outSources : flow.inSources, total = mode === "out" ? flow.outTotal : flow.inTotal;
  let running = 0;
  const series = flow.days.map(bucket => ({ ...bucket, net: running += bucket.in - bucket.out }));
  let lo = Math.min(0, ...series.map(point => point.net)), hi = Math.max(0, ...series.map(point => point.net));
  if (lo === hi) { lo -= 1; hi += 1; }
  const span = hi - lo, min = lo - span * 0.14, max = hi + span * 0.14;
  const y = value => (max - value) / (max - min) * 100;
  const points = series.map((point, index) => ({ x: index / (flow.totalDays - 1) * 100, y: y(point.net) }));
  const curve = smoothCurve(points), zeroY = y(0), offset = zeroY.toFixed(2) + "%";
  const month = flow.month.toLocaleDateString("en-US", { month: "short" });
  return <DialogFrame title="Money flow" chart onClose={onClose}>
    <div className="hm-head hm-flow-head"><div className="hm-head-main"><span className="hm-kicker">{flow.monthLabel}</span><h2 className="hm-title">Money flow</h2></div><button type="button" className="hm-close" aria-label="Close" onClick={onClose}>×</button></div>
    <div className="hm-balance"><div className="hm-balance-main"><span className="hm-balance-kicker">Net this month</span><strong className={"hm-balance-value " + toneOf(flow.net)}>{signedMoney(flow.net)}</strong></div><div className="hm-balance-side"><span className="hm-balance-chip pos">In {money(flow.inTotal)}</span><span className="hm-balance-chip neg">Out {money(flow.outTotal)}</span></div></div>
    <div className="hm-line-block"><div className="hm-line-wrap"><div className="hm-line-y">{[0, 25, 50, 75, 100].map(step => <span key={step} style={{ top: step + "%" }}>{shortMoney(max - step / 100 * (max - min))}</span>)}</div><div className="hm-line-plot">
      <div className="hm-line-grid">{[0, 25, 50, 75, 100].map(step => <i key={step} style={{ top: step + "%" }}></i>)}</div>
      <svg className="hm-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs>
        <linearGradient id="hm-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d4aa" stopOpacity="0.24"/><stop offset={offset} stopColor="#00d4aa" stopOpacity="0.02"/><stop offset={offset} stopColor="#ff4466" stopOpacity="0.02"/><stop offset="100%" stopColor="#ff4466" stopOpacity="0.2"/></linearGradient>
        <linearGradient id="hm-stroke" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d4aa"/><stop offset={offset} stopColor="#00d4aa"/><stop offset={offset} stopColor="#ff4466"/><stop offset="100%" stopColor="#ff4466"/></linearGradient>
      </defs><path d={curve + " L100 " + zeroY.toFixed(2) + " L0 " + zeroY.toFixed(2) + " Z"} fill="url(#hm-area)"/><path d={curve} fill="none" stroke="url(#hm-stroke)" strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {series.map((point, index) => point.events.length ? <span key={point.day} className={"hm-line-dot " + toneOf(point.net) + (day === point.day ? " is-active" : "")} style={{ left: points[index].x + "%", top: points[index].y + "%" }}></span> : null)}
      {day ? <span className="hm-line-cross" style={{ left: points[day - 1].x + "%" }}></span> : null}
      <div className="hm-line-hit">{series.map((point, index) => <button key={point.day} type="button" aria-label={"Day " + point.day} style={{ left: index / flow.totalDays * 100 + "%", width: 100 / flow.totalDays + "%" }} onClick={() => setDay(day === point.day ? null : point.day)}></button>)}</div>
    </div></div><div className="hm-line-x">{[1, Math.round(flow.totalDays * 0.25), Math.round(flow.totalDays * 0.5), Math.round(flow.totalDays * 0.75), flow.totalDays].map(tick => <span key={tick}>{month} {tick}</span>)}</div>
      <div className="hm-readout">{activeDay ? <><span className="hm-readout-date">{month} {day}</span><span className="pos">In <b>{money(activeDay.in)}</b></span><span className="neg">Out <b>{money(activeDay.out)}</b></span><span className={toneOf(series[day - 1].net)}>Net <b>{signedMoney(series[day - 1].net)}</b></span></> : <span>Select a day</span>}</div>
    </div>
    {activeDay ? <div className="hm-day-events">{activeDay.events.length ? activeDay.events.map(event => <button type="button" className="hm-source" key={event.id} onClick={() => onSelect(event)}><span className="hm-src-name">{event.title}</span><span className={"hm-src-amount " + (event.dir === "in" ? "pos" : "neg")}>{(event.dir === "in" ? "+" : "-") + money(event.amount)}</span></button>) : <span className="hm-sources-empty">No activity on this day</span>}</div> : null}
    <div className="hm-block-title"><span>{mode === "out" ? "Spending" : "Income"}</span><div className="hm-mode hm-mode-sm"><button type="button" className={mode === "out" ? "active" : ""} onClick={() => setMode("out")}>Spent</button><button type="button" className={mode === "in" ? "active" : ""} onClick={() => setMode("in")}>Earned</button></div></div>
    <div className="hm-sources">{sources.length ? sources.map(item => <div className="hm-source" key={item.key}><span className="hm-src-name">{item.label}</span><span className="hm-src-pct">{Math.round(item.amount / total * 100)}%</span><span className={"hm-src-amount " + (mode === "in" ? "pos" : "neg")}>{(mode === "in" ? "+" : "-") + money(item.amount)}</span></div>) : <span className="hm-sources-empty">{mode === "out" ? "No expenses yet" : "No income yet"}</span>}</div>
    <details className="hm-coverage"><summary>What is counted</summary><p>USD credits and debits, trade results and redeemed credits. XP, LAVX, unredeemed vouchers, unrealized profit and transfers between your own accounts are excluded.</p>{coverage.map((text, index) => <p key={index}>{text}</p>)}</details>
  </DialogFrame>;
}

function ticketPackEvent(pack) {
  const profit = num(pack.won) - num(pack.cost);
  return {
    id: "pack:" + pack.id, source: "tickets", kind: "summary", title: String(pack.rarity).charAt(0).toUpperCase() + String(pack.rarity).slice(1) + " pack",
    badge: "TICKETS", status: pack.opened === pack.total ? "OPENED" : "PARTIAL",
    amount: profit, asset: "USD", at: pack.purchasedAt, subtitle: "Pack result · revealed tickets only", internal: true,
    facts: [fact("Pack cost", "-" + money(pack.cost), "neg"), fact("Paid out", "+" + money(pack.won), "pos"), fact("Tickets opened", pack.opened + " / " + pack.total), fact("Remaining", String(pack.total - pack.opened)), fact("Pack ID", String(pack.id))],
    timeline: [fact("Purchased", formatDate(pack.purchasedAt)), ...(pack.lastOpenedAt ? [fact("Last opened", formatDate(pack.lastOpenedAt))] : [])]
  };
}
function gameSummaries(data) {
  const games = [];
  const configs = [
    ["slots", "Slots", "total_spins", "total_wins", "total_profit", "biggest_win", "total_wagered", "total_winnings"],
    ["rocket", "Rocket", "totalBets", "winBets", "totalProfit", "maxWin"],
    ["flip", "Flip", "totalBets", "wonBets", "totalProfit", "maxWin"],
    ["pixel", "Pixel", "totalGames", "gamesWon", "totalProfit", "maxWin"],
    ["tickets", "Tickets", "ticketsOpened", null, "netProfit", "bestTicket", "totalSpent", "totalWon"]
  ];
  configs.forEach(([key, title, playsKey, winsKey, profitKey, bestKey, costKey, wonKey]) => {
    const state = data[key];
    if (!state) return;
    const stats = state.myStats || state.stats || {};
    const facts = [fact("Plays", fmtNum(stats[playsKey]))];
    if (winsKey) facts.push(fact("Wins", fmtNum(stats[winsKey])), fact("Losses", fmtNum(num(stats[playsKey]) - num(stats[winsKey]))));
    if (costKey) facts.push(fact("Spent", money(stats[costKey]), "neg"));
    if (wonKey) facts.push(fact("Paid out", money(stats[wonKey]), "pos"));
    facts.push(fact("Best payout", money(stats[bestKey])));
    games.push({ id: "summary:" + key, source: key === "tickets" ? "tickets" : "games", kind: "summary", title,
      amount: num(stats[profitKey]), asset: "USD", at: null, internal: true, badge: "ALL TIME", subtitle: "All-time net result", facts, nav: { path: "/" + (key === "tickets" ? "ticket" : key) } });
  });
  return games;
}
function EventRow({ event, onSelect }) {
  const tone = isCash(event) ? toneOf(event.amount) : "neutral";
  return <button type="button" className="hlist-row" onClick={() => onSelect(event)}>
    <span className={"hlist-icon " + tone}>{event.source === "markets" && event.symbol ? <AssetLogo code={event.symbol} label={event.title}/> : <Glyph type={event.kind === "buy" || event.kind === "send" || event.amount < 0 ? "down" : isCash(event) ? "up" : "gift"}/>}</span>
    <span className="hlist-info"><span className="hlist-name">{event.title}{event.live ? <i className="hm-live-label">Live</i> : null}</span><span className="hlist-sub">{event.live ? "Unrealized P&L" : event.kind === "summary" ? event.subtitle : sourceLabel(event.source) + (event.badge ? " · " + event.badge : "") + (event.internal ? " · Internal transfer" : "")}</span></span>
    <span className="hlist-right"><span className={"hlist-amount " + tone}>{event.display || amountText(event)}</span></span>
  </button>;
}

function History() {
  const navigate = useNavigate();
  const { data, errors, loading, refresh } = useHistoryData();
  const [category, setCategory] = useState("all"), [selected, setSelected] = useState(null), [chart, setChart] = useState(null);
  const [view, setView] = useState("activity"), [livePrices, setLivePrices] = useState({}), [actionError, setActionError] = useState("");
  const events = useMemo(() => buildActivity(data), [data]);
  const flow = useMemo(() => buildMonthFlow(events), [events]);
  const incomplete = errors.some(key => REQUIRED.includes(key));
  const positions = data?.positions || [];
  const coinsKey = [...new Set(positions.map(position => position.coin))].sort().join(",");
  useEffect(() => {
    if (!coinsKey) return;
    let alive = true;
    const load = async () => {
      try {
        const symbols = JSON.stringify(coinsKey.split(",").map(coin => coin + "USDT"));
        const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbols=" + encodeURIComponent(symbols));
        if (!response.ok) return;
        const prices = await response.json();
        if (alive) setLivePrices(Object.fromEntries(prices.map(item => [item.symbol.replace(/USDT$/, ""), num(item.price)])));
      } catch {}
    };
    load();
    const interval = setInterval(load, 10000);
    return () => { alive = false; clearInterval(interval); };
  }, [coinsKey]);
  const liveEvents = positions.map(item => ({ ...tradeEvent(item, livePrices[item.coin] || 0), markPrice: livePrices[item.coin] || 0 }));
  const coverage = [...(data?.activity?.coverage || []), "Trade, transfer, crypto and savings history follows the records returned by their services."];
  const packs = (data?.activity?.ticketPacks || []).map(ticketPackEvent);
  let visible = category === "all" ? events : events.filter(event => event.source === category);
  if (category === "trades") visible = [...liveEvents, ...visible];
  if (view === "summary" && (category === "games" || category === "tickets")) visible = category === "tickets" ? packs : gameSummaries(data || {}).filter(event => event.source === "games");
  if (category === "mining") visible = (data?.mining?.servers || []).map(server => ({
    id: "mining:" + server.id, source: "mining", kind: "summary", title: server.name, asset: "USD", amount: num(server.totalEarned), at: null, internal: true, badge: "MINING", subtitle: "Lifetime server income",
    facts: [fact("Rank", String(server.rank)), fact("Daily rate", money(server.profitPerDay)), fact("Lifetime earned", money(server.totalEarned), "pos")], timeline: [fact("Purchased", formatDate(server.purchasedAt))], nav: { path: "/mining" }
  }));
  const groups = groupEvents(visible);
  const select = event => { setActionError(""); setChart(null); setSelected(event); };
  const onNavigate = nav => { setSelected(null); navigate(nav.path, nav.state ? { state: nav.state } : undefined); };
  const onPositionClose = async event => {
    try { await closePosition(event.position.id, event.markPrice); setSelected(null); refresh(); }
    catch { setActionError("Could not close position. Please try again."); }
  };
  return <div className="HistoryContent"><div className="history-screen"><div className="history-header"><h1>History</h1></div><div className="history-content">
    <div className="hsum-row"><button type="button" className="hsum-card hsum-card-tap" disabled={loading || incomplete} onClick={() => setChart("out")}><span className="hsum-value hsum-value-neg">{loading ? "…" : incomplete ? "—" : money(flow.outTotal)}</span><span className="hsum-label">Spent this month</span></button><button type="button" className="hsum-card hsum-card-tap" disabled={loading || incomplete} onClick={() => setChart("in")}><span className="hsum-value hsum-value-pos">{loading ? "…" : incomplete ? "—" : money(flow.inTotal)}</span><span className="hsum-label">Earned this month</span></button></div>
    {incomplete ? <div className="hm-load-error" role="status"><span>History is incomplete. Some sources could not be loaded.</span><button type="button" onClick={refresh}>Retry</button></div> : null}
    <div className="hpill-row" aria-label="History categories">{Object.entries(SOURCES).map(([key, label]) => <button type="button" key={key} className={"hpill " + (category === key ? "active" : "")} aria-pressed={category === key} onClick={() => { setCategory(key); setView("activity"); }}>{label}</button>)}</div>
    {category === "games" || category === "tickets" ? <div className="hm-history-tabs"><button type="button" className={view === "activity" ? "active" : ""} onClick={() => setView("activity")}>Activity</button><button type="button" className={view === "summary" ? "active" : ""} onClick={() => setView("summary")}>{category === "tickets" ? "By pack" : "All-time totals"}</button></div> : null}
    {category === "mining" ? <p className="hm-history-hint">Mining stores lifetime totals, not dated income. These totals are not assigned to this month.</p> : null}
    {loading ? <div className="hlist-empty">Loading history…</div> : !groups.length ? <div className="hlist-empty">No recorded activity</div> : groups.map(group => <section className="hgrp" key={group.key}><div className="hgrp-header"><span className="hgrp-label">{group.label}</span></div>{group.events.map(event => <EventRow key={event.id} event={event} onSelect={select}/>)}</section>)}
  </div></div>
    {selected ? <><DetailOverlay event={selected.live ? liveEvents.find(event => event.id === selected.id) || selected : selected} onClose={() => setSelected(null)} onNavigate={onNavigate} onPositionClose={onPositionClose}/>{actionError ? <div className="hm-action-error" role="alert">{actionError}</div> : null}</> : null}
    {chart ? <FlowOverlay flow={flow} initialMode={chart} onClose={() => setChart(null)} onSelect={event => select({ ...event, amount: event.dir === "out" ? -event.amount : event.amount })} coverage={coverage}/> : null}
  </div>;
}
export { buildActivity, buildMonthFlow, ticketPackEvent, amountText };
export default History;
