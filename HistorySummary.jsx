import React from "react";

function computeMonthSummary(closedPositions, transfers, cardHistory) {
  var now = new Date();
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  var spend = 0;
  var income = 0;

  (closedPositions || []).forEach(function (p) {
    var t = new Date(p.closedAt).getTime();
    if (t < monthStart) return;
    var pnl = parseFloat(p.pnl) || 0;
    if (pnl >= 0) income += pnl; else spend += Math.abs(pnl);
  });

  (transfers || []).forEach(function (t) {
    var time = new Date(t.createdAt).getTime();
    if (time < monthStart) return;
    var amt = parseFloat(t.amount) || 0;
    if (t.direction === "send") spend += amt; else income += amt;
  });

  (cardHistory || []).forEach(function (c) {
    var time = new Date(c.createdAt).getTime();
    if (time < monthStart) return;
    if (c.operationType === "buy") spend += parseFloat(c.fromAmount) || 0;
    if (c.operationType === "sell") income += parseFloat(c.toAmount) || 0;
  });

  return { spend: spend, income: income };
}

function HistorySummary(props) {
  var summary = computeMonthSummary(props.closedPositions, props.transfers, props.cardHistory);
  var monthLabel = new Date().toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="hsum-row">
      <div className="hsum-card">
        <span className="hsum-value">{"$" + summary.spend.toFixed(2)}</span>
        <span className="hsum-label">{"Spent in " + monthLabel}</span>
        <div className="hsum-bar">
          <span style={{ width: "45%", background: "#ff4466" }}></span>
          <span style={{ width: "30%", background: "hsl(61,85%,78%)" }}></span>
          <span style={{ width: "25%", background: "rgba(255,255,255,0.12)" }}></span>
        </div>
      </div>
      <div className="hsum-card">
        <span className="hsum-value hsum-value-pos">{"$" + summary.income.toFixed(2)}</span>
        <span className="hsum-label">{"Earned in " + monthLabel}</span>
        <div className="hsum-bar">
          <span style={{ width: "70%", background: "#00d4aa" }}></span>
          <span style={{ width: "30%", background: "rgba(255,255,255,0.12)" }}></span>
        </div>
      </div>
    </div>
  );
}

export default HistorySummary;