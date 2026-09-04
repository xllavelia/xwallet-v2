import React from "react";


function HistorySummary(props) {
var summary = useHomeSummary();
  var monthLabel = new Date().toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="hsum-row">
      <div className="hsum-card">
<span className="hsum-value">{summary ? ("$" + summary.totalExpense.toFixed(2)) : "..."}</span>
        <span className="hsum-label">{"Spent in " + monthLabel}</span>
        <div className="hsum-bar">
          <span style={{ width: "45%", background: "#ff4466" }}></span>
          <span style={{ width: "30%", background: "hsl(61,85%,78%)" }}></span>
          <span style={{ width: "25%", background: "rgba(255,255,255,0.12)" }}></span>
        </div>
      </div>
      <div className="hsum-card">
      <span className="hsum-value hsum-value-pos">{summary ? ("$" + summary.totalIncome.toFixed(2)) : "..."}</span>
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