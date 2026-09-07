import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStockCatalog, useStockPortfolio, buyStock, sellStock } from "./useStocks";
import StockChart from "./StockChart";

const StockDetail = () => {
  const location = useLocation();
  var symbol = (location.state && location.state.symbol) || "AAPL";

  var { catalog, refresh: refreshCatalog } = useStockCatalog();
  var { portfolio, refresh: refreshPortfolio } = useStockPortfolio();

  var stock = catalog.find(function (s) { return s.symbol === symbol; }) || { symbol: symbol, name: symbol, color: "#888", price: 0, changePercent: 0, changeAmount: 0 };
  var holding = portfolio ? portfolio.holdings.find(function (h) { return h.symbol === symbol; }) : null;

  var [direction, setDirection] = useState("buy");
  var [amount, setAmount] = useState("");
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);

  var usdAmount = parseFloat(amount) || 0;
  var shareEstimate = stock.price > 0 ? usdAmount / stock.price : 0;
  var isPositive = stock.changePercent >= 0;
  var maxSellUsd = holding ? holding.currentValue : 0;
  var insufficient = direction === "sell" ? usdAmount > maxSellUsd : false;

  async function handleSubmit() {
    if (usdAmount <= 0 || isSubmitting || insufficient) return;
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      if (direction === "buy") {
        var buyResult = await buyStock(symbol, usdAmount);
        setStatusMsg("Bought " + buyResult.quantity.toFixed(4) + " shares of " + symbol);
      } else {
        var sellResult = await sellStock(symbol, usdAmount);
        var pnlStr = sellResult.realizedPnl >= 0
          ? ("+$" + sellResult.realizedPnl.toFixed(2) + " profit")
          : ("-$" + Math.abs(sellResult.realizedPnl).toFixed(2) + " loss");
        setStatusMsg("Sold " + sellResult.quantity.toFixed(4) + " shares · " + pnlStr);
      }
      setStatusOk(true);
      setAmount("");
      refreshCatalog();
      refreshPortfolio();
    } catch (err) {
      setStatusMsg(err.message);
      setStatusOk(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="stkd-page">

      <div className="stkd-header">
        <div className="stkd-avatar" style={{ background: stock.color + "22", color: stock.color, borderColor: stock.color + "44" }}>
          {stock.symbol.slice(0, 2)}
        </div>
        <div className="stkd-header-text">
          <span className="stkd-name">{stock.name}</span>
          <span className="stkd-symbol">{stock.symbol}</span>
        </div>
      </div>

      <div className="stkd-price-block">
        <span className="stkd-price">{"$" + stock.price.toFixed(2)}</span>
        <span className={"stkd-change " + (isPositive ? "pos" : "neg")}>
          {(isPositive ? "+" : "") + stock.changeAmount.toFixed(2) + " (" + (isPositive ? "+" : "") + stock.changePercent.toFixed(2) + "%) Today"}
        </span>
      </div>

      <StockChart symbol={symbol} color={stock.color} />

      {holding && (
        <div className="stkd-holding-card">
          <div className="stkd-holding-left">
            <span className="stkd-holding-label">You own</span>
            <span className="stkd-holding-qty">{holding.quantity.toFixed(4) + " shares"}</span>
          </div>
          <div className="stkd-holding-right">
            <span className="stkd-holding-value">{"$" + holding.currentValue.toFixed(2)}</span>
            <span className={"stkd-holding-pnl " + (holding.unrealizedPnl >= 0 ? "pos" : "neg")}>
              {(holding.unrealizedPnl >= 0 ? "+$" : "-$") + Math.abs(holding.unrealizedPnl).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="stkd-toggle">
        <div className={"stkd-toggle-pill " + direction}></div>
        <button className={"stkd-toggle-btn " + (direction === "buy" ? "active" : "")} onClick={() => setDirection("buy")}>Buy</button>
        <button className={"stkd-toggle-btn " + (direction === "sell" ? "active" : "")} onClick={() => setDirection("sell")}>Sell</button>
      </div>

      <div className="stkd-input-wrap">
        <span className="stkd-input-currency">$</span>
        <input type="number" className="stkd-input" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <span className="stkd-input-hint">
        {direction === "sell" ? ("Available: $" + maxSellUsd.toFixed(2)) : ("≈ " + shareEstimate.toFixed(4) + " shares")}
      </span>

      <div className="stkd-presets">
        {[10, 50, 100, 500].map(function (v) {
          return <button key={v} className="stkd-preset-btn" onClick={() => setAmount(v.toString())}>{"$" + v}</button>;
        })}
      </div>

      {insufficient && <div className="stkd-alert">Insufficient shares to sell that amount</div>}
      {statusMsg && <div className={"stkd-status " + (statusOk ? "ok" : "err")}>{statusMsg}</div>}

      <button
        className={"stkd-submit-btn " + direction}
        disabled={usdAmount <= 0 || insufficient || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? "Processing..." : (direction === "buy" ? "Buy " + symbol : "Sell " + symbol)}
      </button>
    </div>
  );
};

export default StockDetail;