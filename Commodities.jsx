import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCommodityCatalog, useCommodityPortfolio } from "./useCommodities";

const Commodities = () => {
  const navigate = useNavigate();
  var { catalog } = useCommodityCatalog();
  var { portfolio } = useCommodityPortfolio();
  var [tab, setTab] = useState("discover");

  function openCommodity(symbol) {
     navigate(-1);
    setTimeout(function () {
    navigate("/commoditydetail", { state: { symbol: symbol } });

    }, 20);
  }

  var holdings = portfolio ? portfolio.holdings : [];

  return (
    <div className="stks-page">

      <div className="stks-header">
        <span className="stks-eyebrow">Invest</span>
        <h1 className="stks-title">Commodities</h1>
      </div>

      {portfolio && (
        <div className="stks-hero" onClick={() => setTab("holdings")}>
          <span className="stks-hero-label">Portfolio Value</span>
          <span className="stks-hero-value">{"$" + portfolio.totalValue.toFixed(2)}</span>
          <span className={"stks-hero-change " + (portfolio.todayChangeAmount >= 0 ? "pos" : "neg")}>
            {(portfolio.todayChangeAmount >= 0 ? "+$" : "-$") + Math.abs(portfolio.todayChangeAmount).toFixed(2) +
              " (" + (portfolio.todayChangePercent >= 0 ? "+" : "") + portfolio.todayChangePercent.toFixed(2) + "%) Today"}
          </span>
        </div>
      )}

      <div className="stks-tabs">
        <button className={"stks-tab " + (tab === "discover" ? "active" : "")} onClick={() => setTab("discover")}>Discover</button>
        <button className={"stks-tab " + (tab === "holdings" ? "active" : "")} onClick={() => setTab("holdings")}>
          My Holdings {holdings.length > 0 && <span className="stks-tab-badge">{holdings.length}</span>}
        </button>
      </div>

      {tab === "discover" && (
        <div className="stks-discover-grid">
          {catalog.map(function (c) {
            var isPositive = c.changePercent >= 0;
            return (
              <div className="stks-pill" key={c.symbol} onClick={() => openCommodity(c.symbol)}>
                <div className="stks-pill-avatar" style={{ background: c.color + "22", color: c.color }}>{c.name.slice(0, 2).toUpperCase()}</div>
                <div className="stks-pill-info">
                  <span className="stks-pill-symbol">{c.name}</span>
                  <span className="stks-pill-name">{"per " + c.unit}</span>
                </div>
                <div className="stks-pill-right">
                  <span className="stks-pill-price">{"$" + c.price.toFixed(2)}</span>
                  <span className={"stks-pill-change " + (isPositive ? "pos" : "neg")}>{(isPositive ? "+" : "") + c.changePercent.toFixed(2) + "%"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "holdings" && holdings.length === 0 && (
        <div className="stks-empty">
          <span className="stks-empty-title">No holdings yet</span>
          <span className="stks-empty-sub">Buy your first commodity from the Discover tab</span>
        </div>
      )}

      {tab === "holdings" && holdings.length > 0 && (
        <div className="stks-holdings-list">
          {holdings.map(function (h) {
            var isPositive = h.unrealizedPnl >= 0;
            return (
              <div className="stks-holding-row" key={h.symbol} onClick={() => openCommodity(h.symbol)}>
                <div className="stks-pill-avatar" style={{ background: h.color + "22", color: h.color }}>{h.name.slice(0, 2).toUpperCase()}</div>
                <div className="stks-pill-info">
                  <span className="stks-pill-symbol">{h.name}</span>
                  <span className="stks-pill-name">{h.quantity.toFixed(4) + " " + h.unit}</span>
                </div>
                <div className="stks-pill-right">
                  <span className="stks-pill-price">{"$" + h.currentValue.toFixed(2)}</span>
                  <span className={"stks-pill-change " + (isPositive ? "pos" : "neg")}>{(isPositive ? "+$" : "-$") + Math.abs(h.unrealizedPnl).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Commodities;