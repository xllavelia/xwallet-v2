import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePositionsRemote, useClosedPositionsRemote, closePosition } from "./usePositions";
import { useTransfersRemote } from "./useTransfers";
import { useCardHistory } from "./useCardHistory";
import { useSavings } from "./useSavings";
import { Glyph, groupByDate } from "./HistoryShared";
import { useHomeSummary } from "./useHomeSummary";

function safeNum(val) {
  var n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function cardEntryLabel(item) {
  if (item.operationType === "buy") return "Bought " + item.toAsset;
  if (item.operationType === "sell") return "Sold " + item.fromAsset;
  return item.fromAsset + " → " + item.toAsset;
}
function cardEntryAmountStr(item) {
  if (item.operationType === "sell") return "+$" + item.toAmount.toFixed(2);
  return "+" + item.toAmount.toFixed(6) + " " + item.toAsset;
}
function savingsEntryLabel(type) {
  if (type === "interest") return "Interest earned";
  if (type === "deposit") return "Deposit";
  return "Withdrawal";
}

function computeMonthTotals(closedPositions, transfers, cardHistory, savingsHistory) {
  var now = new Date();
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  var spend = 0, income = 0;

  closedPositions.forEach(function (p) {
    if (new Date(p.closedAt).getTime() < monthStart) return;
    var pnl = safeNum(p.pnl);
    if (pnl >= 0) income += pnl; else spend += Math.abs(pnl);
  });
  transfers.forEach(function (t) {
    if (new Date(t.createdAt).getTime() < monthStart) return;
    var amt = safeNum(t.amount);
    if (t.direction === "send") spend += amt; else income += amt;
  });
  cardHistory.forEach(function (c) {
    if (new Date(c.createdAt).getTime() < monthStart) return;
    if (c.operationType === "buy") spend += safeNum(c.fromAmount);
    if (c.operationType === "sell") income += safeNum(c.toAmount);
  });
  savingsHistory.forEach(function (s) {
    if (new Date(s.createdAt).getTime() < monthStart) return;
    if (s.entryType === "interest") income += safeNum(s.amount);
    // deposits/withdrawals are internal transfers between your own accounts — not counted as spend/income
  });

  return { spend: spend, income: income };
}

const History = () => {
  const navigate = useNavigate();
var summary = useHomeSummary();
  const { positions, refresh: refreshOpen } = usePositionsRemote();
  const { closedPositions } = useClosedPositionsRemote();
  const { transfers } = useTransfersRemote();
  const { history: cardHistory } = useCardHistory();
  const { savings } = useSavings();

  const [activePill, setActivePill] = useState("transfers");
  const [selectedActivePosId, setSelectedActivePosId] = useState(null);
  const [selectedCompletedTrade, setSelectedCompletedTrade] = useState(null);
  const [selectedCardEntry, setSelectedCardEntry] = useState(null);
  const [selectedSavingsEntry, setSelectedSavingsEntry] = useState(null);
  const [livePrices, setLivePrices] = useState({});

  useEffect(function () {
    if (positions.length === 0) return;
    var uniqueCoins = [];
    positions.forEach(function (p) { if (uniqueCoins.indexOf(p.coin) === -1) uniqueCoins.push(p.coin); });
    var symbols = JSON.stringify(uniqueCoins.map(function (c) { return c + "USDT"; }));
    function doFetch() {
      fetch("https://api.binance.com/api/v3/ticker/price?symbols=" + symbols)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var prices = {};
          data.forEach(function (item) { prices[item.symbol.replace("USDT", "")] = parseFloat(item.price); });
          setLivePrices(prices);
        })
        .catch(function () {});
    }
    doFetch();
    var iv = setInterval(doFetch, 10000);
    return function () { clearInterval(iv); };
  }, [positions.length]);

  function formatDate(iso) {
    if (!iso) return "--";
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function formatDuration(openedAt, closedAt) {
    var ms = new Date(closedAt).getTime() - new Date(openedAt).getTime();
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (h > 0) return h + "h " + m + "m";
    if (m > 0) return m + "m " + sec + "s";
    return sec + "s";
  }
  function timeAgo(iso) {
    var ms = Date.now() - new Date(iso).getTime();
    var h = Math.floor(ms / 3600000);
    var m = Math.floor((ms % 3600000) / 60000);
    if (h > 0) return h + "h " + m + "m ago";
    if (m > 0) return m + "m ago";
    return "just now";
  }

  var positionCards = positions.map(function (pos) {
    var livePrice = livePrices[pos.coin] || 0;
    var pnl = livePrice > 0 && pos.entryPrice > 0 && pos.margin > 0
      ? pos.margin * pos.leverage * ((livePrice - pos.entryPrice) / pos.entryPrice) * (pos.type === "long" ? 1 : -1)
      : 0;
    var pnlPct = pos.margin > 0 ? (pnl / pos.margin) * 100 : 0;
    var sign = pnl >= 0 ? "+" : "";
    return {
      id: pos.id, tradeId: pos.tradeId, coin: pos.coin, type: pos.type, leverage: pos.leverage,
      entryPrice: pos.entryPrice, liqPrice: pos.liqPrice, margin: pos.margin, amount: pos.amount,
      fees: pos.fees, feesPaidByVoucher: pos.feesPaidByVoucher, autoClose: pos.autoClose,
      autoCloseTarget: pos.autoCloseTarget, livePrice: livePrice, pnl: pnl,
      pnlStr: sign + "$" + pnl.toFixed(2), pnlPctStr: sign + pnlPct.toFixed(2) + "%",
      pnlClass: pnl >= 0 ? "pos" : "neg", typeClass: "et-pos-badge " + pos.type,
      entryStr: "$" + pos.entryPrice.toLocaleString("en-US"), liqStr: "$" + Math.round(pos.liqPrice).toLocaleString("en-US"),
      livePriceStr: livePrice > 0 ? "$" + livePrice.toLocaleString("en-US") : "--", marginStr: "$" + pos.margin.toFixed(2),
      openedAgo: timeAgo(pos.openedAt), openTime: pos.openedAt
    };
  });

  var managedPos = null;
  for (var k = 0; k < positionCards.length; k++) {
    if (positionCards[k].id === selectedActivePosId) { managedPos = positionCards[k]; break; }
  }

  function handleCloseFromHistory() {
    if (!managedPos || managedPos.livePrice <= 0) return;
    closePosition(managedPos.id, managedPos.livePrice).then(refreshOpen);
    setSelectedActivePosId(null);
  }
  function handleDuplicate() {
    if (!managedPos) return;
    navigate("/order", { state: { coin: managedPos.coin, type: managedPos.type, price: managedPos.livePrice > 0 ? managedPos.livePrice.toString() : managedPos.entryPrice.toString(), change: "+0.00%", leverage: managedPos.leverage, amount: managedPos.amount } });
  }
  function handleGoToChart() {
    if (!managedPos) return;
    navigate("/trade", { state: { coin: managedPos.coin } });
  }
  function handleOpenTransfer(transferId) {
    navigate("/sendcheck", { state: { transferId: transferId } });
  }

  // ── Build normalized rows for the active pill ─────────────
  var rows = [];

  if (activePill === "trades") {
    positionCards.forEach(function (card) {
      rows.push({
        key: "a" + card.id, glyphType: card.type === "long" ? "up" : "down",
        name: card.coin + " " + card.type.toUpperCase(), sub: card.leverage + "x · Live",
        amountStr: card.pnlStr, amountClass: card.pnl >= 0 ? "pos" : "neg", amountSigned: card.pnl,
        dateRaw: card.openTime, onClick: function () { setSelectedActivePosId(card.id); }
      });
    });
    closedPositions.forEach(function (item) {
      var pnl = safeNum(item.pnl);
      var sign = pnl >= 0 ? "+" : "";
      rows.push({
        key: "c" + item.id, glyphType: item.type === "long" ? "up" : "down",
        name: item.coin + " " + item.type.toUpperCase(), sub: item.leverage + "x · " + (item.result === "win" ? "Won" : "Lost"),
        amountStr: sign + "$" + pnl.toFixed(2), amountClass: pnl >= 0 ? "pos" : "neg", amountSigned: pnl,
        dateRaw: item.closedAt, onClick: function () { setSelectedCompletedTrade(item); }
      });
    });
  }

  if (activePill === "transfers") {
    transfers.forEach(function (item) {
      var isSend = item.direction === "send";
      var amt = safeNum(item.amount);
      rows.push({
        key: "t" + item.id, glyphType: isSend ? "down" : "up",
        name: (isSend ? "To " : "From ") + item.counterparty,
        sub: "Transfer" + (item.xpAwarded > 0 ? " · +" + item.xpAwarded + " XP" : ""),
        amountStr: (isSend ? "-$" : "+$") + amt.toFixed(2), amountClass: isSend ? "neg" : "pos",
        amountSigned: isSend ? -amt : amt, dateRaw: item.createdAt,
        onClick: function () { handleOpenTransfer(item.id); }
      });
    });
  }

  if (activePill === "card") {
    cardHistory.forEach(function (item) {
      var glyphType = item.operationType === "buy" ? "up" : (item.operationType === "sell" ? "down" : "swap");
      rows.push({
        key: "cd" + item.id, glyphType: glyphType,
        name: cardEntryLabel(item),
        sub: item.operationType.toUpperCase() + (item.xpAwarded > 0 ? " · +" + item.xpAwarded + " XP" : ""),
        amountStr: cardEntryAmountStr(item), amountClass: "pos", amountSigned: 0,
        dateRaw: item.createdAt, onClick: function () { setSelectedCardEntry(item); }
      });
    });
  }

  if (activePill === "savings") {
    (savings ? savings.history : []).forEach(function (item) {
      var isWithdrawal = item.entryType === "withdrawal";
      var amt = safeNum(item.amount);
      var glyphType = item.entryType === "deposit" ? "up" : (isWithdrawal ? "down" : "gift");
      rows.push({
        key: "s" + item.id, glyphType: glyphType,
        name: savingsEntryLabel(item.entryType), sub: "Savings Account",
        amountStr: (isWithdrawal ? "-$" : "+$") + amt.toFixed(2), amountClass: isWithdrawal ? "neg" : "pos",
        amountSigned: isWithdrawal ? -amt : amt, dateRaw: item.createdAt,
        onClick: function () { setSelectedSavingsEntry(item); }
      });
    });
  }

  var groups = groupByDate(rows);
  var monthTotals = computeMonthTotals(closedPositions, transfers, cardHistory, savings ? savings.history : []);

  var sel = selectedCompletedTrade;
  var selPnl = sel ? safeNum(sel.pnl) : 0;
  var selPnlPct = sel ? safeNum(sel.pnlPercent) : 0;
  var selRoi = sel && sel.amount > 0 ? (selPnl / sel.amount) * 100 : 0;
  var selSign = selPnl >= 0 ? "+" : "";

  var managedPnlClass = managedPos ? (managedPos.pnl >= 0 ? "ht-detail-pnl pos" : "ht-detail-pnl neg") : "";
  var managedTypeClass = managedPos ? ("et-pos-badge " + managedPos.type) : "";
  var managedAcStr = managedPos && managedPos.autoClose && managedPos.autoCloseTarget ? "TP +" + managedPos.autoCloseTarget + "%" : "Off";

  return (
    <div className="HistoryContent">

      {managedPos && (
        <div className="ht-detail-overlay" onClick={() => setSelectedActivePosId(null)}>
          <div className="ht-detail-modal" onClick={function (e) { e.stopPropagation(); }}>
            <div className="ht-detail-handle"></div>
            <div className="ht-detail-top">
              <span className={managedTypeClass}>{managedPos.type.toUpperCase()}</span>
              <span className="ht-detail-coin">{managedPos.coin}</span>
              <span className="et-pos-lev">{managedPos.leverage + "x"}</span>
              <span className="ht-active-badge">LIVE</span>
              <button className="ht-detail-close" onClick={() => setSelectedActivePosId(null)}>✕</button>
            </div>
            <div className={managedPnlClass}>
              <span className="ht-detail-pnl-val">{managedPos.pnlStr}</span>
              <span className="ht-detail-pnl-pct">{managedPos.pnlPctStr}</span>
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-detail-grid">
              <div className="ht-detail-row"><span className="ht-dl">Entry Price</span><span className="ht-dv">{managedPos.entryStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Current Price</span><span className="ht-dv">{managedPos.livePriceStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Liq. Price</span><span className="ht-dv ht-dv-liq">{managedPos.liqStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Margin</span><span className="ht-dv">{managedPos.marginStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Position Size</span><span className="ht-dv">{"$" + managedPos.amount.toFixed(2)}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Fees</span><span className="ht-dv">{managedPos.feesPaidByVoucher ? "Voucher" : "$" + managedPos.fees.toFixed(2)}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Auto Close</span><span className="ht-dv">{managedAcStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Opened</span><span className="ht-dv ht-dv-date">{managedPos.openedAgo}</span></div>
              {managedPos.tradeId && <div className="ht-detail-row"><span className="ht-dl">Trade ID</span><span className="ht-dv et-pmv-id">{managedPos.tradeId}</span></div>}
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-action-row">
              <button className="ht-chart-btn" onClick={handleGoToChart}>Chart</button>
              <button className="ht-duplicate-btn" onClick={handleDuplicate}>Duplicate</button>
              <button className="ht-close-btn-modal" onClick={handleCloseFromHistory}>Close</button>
            </div>
          </div>
        </div>
      )}

      {sel && (
        <div className="ht-detail-overlay" onClick={() => setSelectedCompletedTrade(null)}>
          <div className="ht-detail-modal" onClick={function (e) { e.stopPropagation(); }}>
            <div className="ht-detail-handle"></div>
            <div className="ht-detail-top">
              <span className={"et-pos-badge " + (sel.type || "long")}>{(sel.type || "long").toUpperCase()}</span>
              <span className="ht-detail-coin">{sel.coin}</span>
              <span className={"ht-result-badge " + (sel.result || "loss")}>{sel.result === "win" ? "WIN" : "LOSS"}</span>
              <button className="ht-detail-close" onClick={() => setSelectedCompletedTrade(null)}>✕</button>
            </div>
            <div className={selPnl >= 0 ? "ht-detail-pnl pos" : "ht-detail-pnl neg"}>
              <span className="ht-detail-pnl-val">{selSign + "$" + selPnl.toFixed(2)}</span>
              <span className="ht-detail-pnl-pct">{selSign + selPnlPct.toFixed(2) + "%"}</span>
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-detail-grid">
              <div className="ht-detail-row"><span className="ht-dl">Entry Price</span><span className="ht-dv">{"$" + sel.entryPrice.toLocaleString("en-US")}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Close Price</span><span className="ht-dv">{"$" + (sel.closePrice || 0).toLocaleString("en-US")}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Liq. Price</span><span className="ht-dv ht-dv-liq">{"$" + Math.round(sel.liqPrice).toLocaleString("en-US")}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Leverage</span><span className="ht-dv ht-dv-lev">{sel.leverage + "x"}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Position Size</span><span className="ht-dv">{"$" + sel.amount.toFixed(2)}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Margin Used</span><span className="ht-dv">{"$" + sel.margin.toFixed(2)}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Fees</span><span className="ht-dv">{sel.feesPaidByVoucher ? "Covered by Voucher" : "$" + sel.fees.toFixed(2)}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">ROI</span><span className="ht-dv">{(selRoi >= 0 ? "+" : "") + selRoi.toFixed(2) + "%"}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Duration</span><span className="ht-dv">{formatDuration(sel.openedAt, sel.closedAt)}</span></div>
              {sel.tradeId && <div className="ht-detail-row"><span className="ht-dl">Trade ID</span><span className="ht-dv et-pmv-id">{sel.tradeId}</span></div>}
              {sel.xpAwarded > 0 && <div className="ht-detail-row"><span className="ht-dl">Battle Pass XP</span><span className="ht-dv" style={{ color: "var(--xlavelia)" }}>{"+" + sel.xpAwarded}</span></div>}
              {sel.cashbackAwarded > 0 && (
              <div className="ht-detail-row"><span className="ht-dl">Cashback</span><span className="ht-dv" style={{ color: "#00d4aa" }}>{"+$" + sel.cashbackAwarded.toFixed(2)}</span></div>
              )}
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-detail-dates">
              <div className="ht-detail-row"><span className="ht-dl">Opened</span><span className="ht-dv ht-dv-date">{formatDate(sel.openedAt)}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Closed</span><span className="ht-dv ht-dv-date">{formatDate(sel.closedAt)}</span></div>
            </div>
          </div>
        </div>
      )}

      {selectedCardEntry && (
        <div className="ht-detail-overlay" onClick={() => setSelectedCardEntry(null)}>
          <div className="ht-detail-modal" onClick={function (e) { e.stopPropagation(); }}>
            <div className="ht-detail-handle"></div>
            <div className="ht-detail-top">
              <span className={"et-pos-badge " + (selectedCardEntry.operationType === "sell" ? "short" : "long")}>{selectedCardEntry.operationType.toUpperCase()}</span>
              <span className="ht-detail-coin">
                {selectedCardEntry.operationType === "swap"
                  ? selectedCardEntry.fromAsset + " → " + selectedCardEntry.toAsset
                  : (selectedCardEntry.operationType === "buy" ? selectedCardEntry.toAsset : selectedCardEntry.fromAsset)}
              </span>
              <button className="ht-detail-close" onClick={() => setSelectedCardEntry(null)}>✕</button>
            </div>
            <div className="ht-detail-pnl pos">
              <span className="ht-detail-pnl-val">{cardEntryAmountStr(selectedCardEntry)}</span>
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-detail-grid">
              <div className="ht-detail-row"><span className="ht-dl">Type</span><span className="ht-dv">{selectedCardEntry.operationType.charAt(0).toUpperCase() + selectedCardEntry.operationType.slice(1)}</span></div>
              {selectedCardEntry.operationType === "swap" && (<>
                <div className="ht-detail-row"><span className="ht-dl">From</span><span className="ht-dv">{selectedCardEntry.fromAmount.toFixed(6) + " " + selectedCardEntry.fromAsset}</span></div>
                <div className="ht-detail-row"><span className="ht-dl">To</span><span className="ht-dv">{selectedCardEntry.toAmount.toFixed(6) + " " + selectedCardEntry.toAsset}</span></div>
              </>)}
              {selectedCardEntry.operationType === "buy" && (<>
                <div className="ht-detail-row"><span className="ht-dl">Spent</span><span className="ht-dv">{"$" + selectedCardEntry.fromAmount.toFixed(2)}</span></div>
                <div className="ht-detail-row"><span className="ht-dl">Received</span><span className="ht-dv">{selectedCardEntry.toAmount.toFixed(6) + " " + selectedCardEntry.toAsset}</span></div>
              </>)}
              {selectedCardEntry.operationType === "sell" && (<>
                <div className="ht-detail-row"><span className="ht-dl">Sold</span><span className="ht-dv">{selectedCardEntry.fromAmount.toFixed(6) + " " + selectedCardEntry.fromAsset}</span></div>
                <div className="ht-detail-row"><span className="ht-dl">Received</span><span className="ht-dv">{"$" + selectedCardEntry.toAmount.toFixed(2)}</span></div>
              </>)}
              <div className="ht-detail-row"><span className="ht-dl">Price</span><span className="ht-dv">{"$" + selectedCardEntry.price.toLocaleString("en-US")}</span></div>
              {selectedCardEntry.xpAwarded > 0 && <div className="ht-detail-row"><span className="ht-dl">Battle Pass XP</span><span className="ht-dv" style={{ color: "var(--xlavelia)" }}>{"+" + selectedCardEntry.xpAwarded}</span></div>}
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-detail-dates">
              <div className="ht-detail-row"><span className="ht-dl">Executed</span><span className="ht-dv ht-dv-date">{formatDate(selectedCardEntry.createdAt)}</span></div>
            </div>
          </div>
        </div>
      )}

      {selectedSavingsEntry && (
        <div className="ht-detail-overlay" onClick={() => setSelectedSavingsEntry(null)}>
          <div className="ht-detail-modal" onClick={function (e) { e.stopPropagation(); }}>
            <div className="ht-detail-handle"></div>
            <div className="ht-detail-top">
              <span className="ht-detail-coin">{savingsEntryLabel(selectedSavingsEntry.entryType)}</span>
              <button className="ht-detail-close" onClick={() => setSelectedSavingsEntry(null)}>✕</button>
            </div>
            <div className={selectedSavingsEntry.entryType === "withdrawal" ? "ht-detail-pnl neg" : "ht-detail-pnl pos"}>
              <span className="ht-detail-pnl-val">{(selectedSavingsEntry.entryType === "withdrawal" ? "-$" : "+$") + selectedSavingsEntry.amount.toFixed(2)}</span>
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-detail-grid">
              <div className="ht-detail-row"><span className="ht-dl">Account</span><span className="ht-dv">Savings</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Date</span><span className="ht-dv ht-dv-date">{formatDate(selectedSavingsEntry.createdAt)}</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="history-screen">
        <div className="history-header"><h1>History</h1></div>

        <div className="history-content" style={{ display: "flex", flexDirection: "column", gap: 18, padding: "0 4px 100px" }}>

       <div className="hsum-row">
  <div className="hsum-card">
    <span className="hsum-value">{summary ? ("$" + summary.totalExpense.toFixed(2)) : "..."}</span>
    <span className="hsum-label">Spent this month</span>
    {summary && (
      <div className="hsum-bar">
        {summary.categories.map(function (cat, idx) {
          var totalCat = summary.categories.reduce(function (acc, c) { return acc + c.amount; }, 0) || 1;
          var pct = (cat.amount / totalCat) * 100;
          var colors = ["#ff4466", "hsl(61,85%,78%)", "#8a4fe0", "#2f6fed", "rgba(255,255,255,0.15)"];
          return <span key={cat.key} style={{ width: pct + "%", background: colors[idx % colors.length] }}></span>;
        })}
      </div> 
    )}
  </div>
  <div className="hsum-card">
    <span className="hsum-value hsum-value-pos">{summary ? ("$" + summary.totalIncome.toFixed(2)) : "..."}</span>
    <span className="hsum-label">Earned this month</span>
    {summary && summary.totalIncome > 0 && (
      <div className="hsum-bar">
        <span style={{ width: "100%", background: "#00d4aa" }}></span>
      </div>
    )}
  </div>
</div>

          <div className="hpill-row">
            <button className={"hpill " + (activePill === "trades" ? "active" : "")} onClick={() => setActivePill("trades")}>Trades</button>
            <button className={"hpill " + (activePill === "transfers" ? "active" : "")} onClick={() => setActivePill("transfers")}>Transfers</button>
            <button className={"hpill " + (activePill === "card" ? "active" : "")} onClick={() => setActivePill("card")}>Card</button>
            <button className={"hpill " + (activePill === "savings" ? "active" : "")} onClick={() => setActivePill("savings")}>Savings</button>
          </div>

          {groups.length === 0 && <div className="hlist-empty">Nothing here yet</div>}

          {groups.map(function (group) {
            var totalSign = group.total >= 0 ? "+" : "-";
            return (
              <div className="hgrp" key={group.label}>
                <div className="hgrp-header">
                  <span className="hgrp-label">{group.label}</span>
                  <span className="hgrp-total">{totalSign + "$" + Math.abs(group.total).toFixed(2)}</span>
                </div>
                {group.rows.map(function (row) {
                  return (
                    <div className="hlist-row" key={row.key} onClick={row.onClick}>
                      <div className={"hlist-icon " + row.amountClass}><Glyph type={row.glyphType} /></div>
                      <div className="hlist-info">
                        <span className="hlist-name">{row.name}</span>
                        <span className="hlist-sub">{row.sub}</span>
                      </div>
                      <div className="hlist-right">
                        <span className={"hlist-amount " + row.amountClass}>{row.amountStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default History;