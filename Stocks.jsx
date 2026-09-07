import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStockCatalog, useStockPortfolio } from "./useStocks";

const Stocks = () => {
  const navigate = useNavigate();
  var { catalog } = useStockCatalog();
  var { portfolio } = useStockPortfolio();
  var [tab, setTab] = useState("discover");

  function openStock(symbol) {
       navigate(-1);
    setTimeout(function () {
    navigate("/stockdetail", { state: { symbol: symbol } });
    }, 20);
  }

  var holdings = portfolio ? portfolio.holdings : [];

  return (
    <div className="stks-page">

      <div className="stks-header">
        <span className="stks-eyebrow">Invest</span>
        <h1 className="stks-title">Stocks</h1>
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
          {catalog.map(function (s) {
            var isPositive = s.changePercent >= 0;
            return (
              <div className="stks-pill" key={s.symbol} onClick={() => openStock(s.symbol)}>
                <div className="stks-pill-avatar" style={{ background: s.color + "22", color: s.color }}>{s.symbol.slice(0, 2)}</div>
                <div className="stks-pill-info">
                  <span className="stks-pill-symbol">{s.symbol}</span>
                  <span className="stks-pill-name">{s.name}</span>
                </div>
                <div className="stks-pill-right">
                  <span className="stks-pill-price">{"$" + s.price.toFixed(2)}</span>
                  <span className={"stks-pill-change " + (isPositive ? "pos" : "neg")}>{(isPositive ? "+" : "") + s.changePercent.toFixed(2) + "%"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "holdings" && holdings.length === 0 && (
        <div className="stks-empty">
          <span className="stks-empty-title">No holdings yet</span>
          <span className="stks-empty-sub">Buy your first stock from the Discover tab</span>
        </div>
      )}

      {tab === "holdings" && holdings.length > 0 && (
        <div className="stks-holdings-list">
          {holdings.map(function (h) {
            var isPositive = h.unrealizedPnl >= 0;
            return (
              <div className="stks-holding-row" key={h.symbol} onClick={() => openStock(h.symbol)}>
                <div className="stks-pill-avatar" style={{ background: h.color + "22", color: h.color }}>{h.symbol.slice(0, 2)}</div>
                <div className="stks-pill-info">
                  <span className="stks-pill-symbol">{h.symbol}</span>
                  <span className="stks-pill-name">{h.quantity.toFixed(4) + " shares"}</span>
                </div>
                <div className="stks-pill-right">
                  <span className="stks-pill-price">{"$" + h.currentValue.toFixed(2)}</span>
                  <span className={"stks-pill-change " + (isPositive ? "pos" : "neg")}>
                    {(isPositive ? "+$" : "-$") + Math.abs(h.unrealizedPnl).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Stocks;