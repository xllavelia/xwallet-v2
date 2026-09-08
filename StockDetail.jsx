import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createChart, LineSeries } from "lightweight-charts";
import { useStockCatalog, useStockPortfolio, fetchStockChart, buyStock, sellStock } from "./useStocks";

var TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y"];

function ChevronLeft() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
}
function StarIcon() {
  return (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>);
}
function ShareIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>);
}
function ReceiveGridIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg>);
}
function MoreDotsIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"></circle><circle cx="12" cy="12" r="1.8"></circle><circle cx="19" cy="12" r="1.8"></circle></svg>);
}
function CheckShieldIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="8.5 12.5 11 15 15.5 9"></polyline></svg>);
}

const StockDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  var symbol = (location.state && location.state.symbol) || "AAPL";

  var { catalog, refresh: refreshCatalog } = useStockCatalog();
  var { portfolio, refresh: refreshPortfolio } = useStockPortfolio();

  var stock = catalog.find(function (s) { return s.symbol === symbol; }) || { symbol: symbol, name: symbol, color: "#a3e635", price: 0, changePercent: 0, changeAmount: 0 };
  var holding = portfolio ? portfolio.holdings.find(function (h) { return h.symbol === symbol; }) : null;
  var isPositive = stock.changePercent >= 0;
  var accentColor = isPositive ? "var(--xlavelia)" : "#ff5c5c";

  var [view, setView] = useState("panel"); // "panel" | "info"
  var [timeframe, setTimeframe] = useState("15m");
  var [direction, setDirection] = useState("buy");
  var [amount, setAmount] = useState("");
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);

  var containerRef = useRef(null);
  var chartRef = useRef(null);
  var seriesRef = useRef(null);

  useEffect(function () {
    if (!containerRef.current) return;
    var chart = createChart(containerRef.current, {
      layout: { background: { type: "solid", color: "transparent" }, textColor: "rgba(255,255,255,0.25)" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: true, borderVisible: false, timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: "rgba(255,255,255,0.15)", labelBackgroundColor: "#1a1a1a" }, horzLine: { visible: false, labelVisible: false } },
      handleScroll: false,
      handleScale: false,
      autoSize: true
    });
    var series = chart.addSeries(LineSeries, {
      color: accentColor, lineWidth: 2.5, priceLineVisible: false, lastValueVisible: false,
      crosshairMarkerRadius: 4, crosshairMarkerBorderColor: accentColor, crosshairMarkerBackgroundColor: "#0a0a0a"
    });
    chartRef.current = chart;
    seriesRef.current = series;
    return function () { chart.remove(); };
  }, [accentColor]);

  useEffect(function () {
    if (!seriesRef.current) return;
    var tfMap = { "15m": "1D", "1h": "1D", "1d": "1M", "1w": "1Y" };
    fetchStockChart(symbol, tfMap[timeframe] || "1M").then(function (points) {
      var data = (points || []).map(function (p) { return { time: p.time, value: p.price }; });
      seriesRef.current.setData(data);
      if (chartRef.current) chartRef.current.timeScale().fitContent();
    }).catch(function () {});
  }, [symbol, timeframe]);

  var usdAmount = parseFloat(amount) || 0;
  var shareEstimate = stock.price > 0 ? usdAmount / stock.price : 0;
  var maxSellUsd = holding ? holding.currentValue : 0;
  var insufficient = direction === "sell" ? usdAmount > maxSellUsd : false;

  async function handleSubmit() {
    if (usdAmount <= 0 || isSubmitting || insufficient) return;
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      if (direction === "buy") {
        var buyResult = await buyStock(symbol, usdAmount);
        setStatusMsg("Bought " + buyResult.quantity.toFixed(4) + " shares");
      } else {
        var sellResult = await sellStock(symbol, usdAmount);
        var pnlStr = sellResult.realizedPnl >= 0 ? ("+$" + sellResult.realizedPnl.toFixed(2)) : ("-$" + Math.abs(sellResult.realizedPnl).toFixed(2));
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
    <div className="sdp-page">

      <div className="sdp-topbar">
        <button className="sdp-icon-btn" onClick={() => navigate(-1)}><ChevronLeft /></button>
        <div className="sdp-identity">
          <div className="sdp-avatar" style={{ background: stock.color + "26", color: stock.color, borderColor: stock.color + "40" }}>
            {stock.symbol.slice(0, 2)}
          </div>
          <div className="sdp-identity-text">
            <div className="sdp-name-row">
              <span className="sdp-name">{stock.name}</span>
              <CheckShieldIcon />
            </div>
            <span className="sdp-address">{stock.symbol}</span>
          </div>
        </div>
        <div className="sdp-topbar-actions">
          <button className="sdp-icon-btn"><StarIcon /></button>
          <button className="sdp-icon-btn"><ShareIcon /></button>
        </div>
      </div>

      <div className="sdp-price-block">
        <span className="sdp-price">{"$" + stock.price.toFixed(stock.price < 1 ? 4 : 2)}</span>
        <span className={"sdp-change " + (isPositive ? "pos" : "neg")}>
          {(isPositive ? "+$" : "-$") + Math.abs(stock.changeAmount).toFixed(2) + " (" + (isPositive ? "+" : "") + stock.changePercent.toFixed(2) + "%) Today"}
        </span>
      </div>

      <div className="sdp-timeframes">
        {["1m", "5m", "15m", "1h", "4h", "1d", "1w"].map(function (tf) {
          return <button key={tf} className={"sdp-tf-btn " + (timeframe === tf ? "active" : "")} onClick={() => setTimeframe(tf)}>{tf}</button>;
        })}
      </div>

      <div className="sdp-chart-canvas" ref={containerRef}></div>

      <div className="sdp-sheet">
       

        {view === "panel" && (
          <div className="sdp-trade-panel">

            {holding && (
              <div className="sdp-holding-row">
                <span className="sdp-holding-label">You own</span>
                <span className="sdp-holding-qty">{holding.quantity.toFixed(4) + " shares"}</span>
                <span className="sdp-holding-value">{"$" + holding.currentValue.toFixed(2)}</span>
              </div>
            )}

            <div className="sdp-toggle">
              <div className={"sdp-toggle-pill " + direction}></div>
              <button className={"sdp-toggle-btn " + (direction === "buy" ? "active" : "")} onClick={() => setDirection("buy")}>Buy</button>
              <button className={"sdp-toggle-btn " + (direction === "sell" ? "active" : "")} onClick={() => setDirection("sell")}>Sell</button>
            </div>

            <div className="sdp-input-row">
              <span className="sdp-input-currency">$</span>
              <input type="number" className="sdp-input" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <span className="sdp-input-hint">
              {direction === "sell" ? ("Available $" + maxSellUsd.toFixed(2)) : ("≈ " + shareEstimate.toFixed(4) + " shares")}
            </span>

            <div className="sdp-presets">
              {[10, 50, 100, 500].map(function (v) {
                return <button key={v} className="sdp-preset-btn" onClick={() => setAmount(v.toString())}>{"$" + v}</button>;
              })}
            </div>

            {insufficient && <div className="sdp-alert">Insufficient shares to sell that amount</div>}
            {statusMsg && <div className={"sdp-status " + (statusOk ? "ok" : "err")}>{statusMsg}</div>}

            <button className={"sdp-submit-btn " + direction} disabled={usdAmount <= 0 || insufficient || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? "Processing..." : (direction === "buy" ? "Buy " + symbol : "Sell " + symbol)}
            </button>

          
          </div>
        )}

     
          <div className="sdp-info-panel">
            <div className="sdp-info-block">
              <span className="sdp-info-eyebrow">Market Insight</span>
              <p className="sdp-info-text">
                {stock.name} is part of the top 20 digital-economy companies tracked in this app,
                with pricing sourced live from public market data.
              </p>
            </div>

            <div className="sdp-info-divider"></div>

            <span className="sdp-info-heading">Token Description</span>
            <div className="sdp-info-row"><span>Symbol</span><span>{stock.symbol}</span></div>
            <div className="sdp-info-row"><span>Company</span><span>{stock.name}</span></div>

            <div className="sdp-info-divider"></div>

            <span className="sdp-info-heading">Market Details</span>
            <div className="sdp-info-row"><span>Current Price</span><span>{"$" + stock.price.toFixed(2)}</span></div>
            <div className="sdp-info-row"><span>Today's Change</span><span className={isPositive ? "pos" : "neg"}>{(isPositive ? "+" : "") + stock.changePercent.toFixed(2) + "%"}</span></div>
            {holding && (
              <>
                <div className="sdp-info-row"><span>Avg. Cost</span><span>{"$" + holding.avgCost.toFixed(2)}</span></div>
                <div className="sdp-info-row"><span>Unrealized P&L</span><span className={holding.unrealizedPnl >= 0 ? "pos" : "neg"}>{(holding.unrealizedPnl >= 0 ? "+$" : "-$") + Math.abs(holding.unrealizedPnl).toFixed(2)}</span></div>
              </>
            )}

            <div className="sdp-info-divider"></div>

            <div className="sdp-trust-badge">
              <CheckShieldIcon />
              <span>Verified</span>
            </div>
            <div className="sdp-trust-tags">
              <span className="sdp-trust-tag"><CheckShieldIcon /> Established reputation</span>
              <span className="sdp-trust-tag"><CheckShieldIcon /> Public market data</span>
            </div>
          </div>
        
      </div>
    </div>
  );
};

export default StockDetail;