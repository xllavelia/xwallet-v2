import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createChart, AreaSeries, CandlestickSeries } from "lightweight-charts";
import { useStockCatalog, useStockPortfolio, fetchStockChart, buyStock, sellStock } from "./useStocks";
import { useCommodityCatalog, useCommodityPortfolio, fetchCommodityChart, buyCommodity, sellCommodity } from "./useCommodities";
import { useWalletBalance } from "./useWallet";
import {
  fmtUsd,
  fmtPrice,
  fmtQty,
  signedUsd,
  signedPct,
  toneOf,
  alphaColor,
  IconBack,
  IconChart
} from "./marketsShared";
import { AssetLogo } from "./AssetLogos";

var RANGES = ["1D", "1W", "1M", "3M", "1Y"];
var CHART_UP = "#39d98a";
var CHART_DOWN = "#ff6b6b";

function StarIcon({ filled }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2.8 15 8.9 21.5 9.8 16.8 14.4 17.9 21 12 17.9 6.1 21 7.2 14.4 2.5 9.8 9 8.9"></polygon></svg>;
}

function CandleIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="7" y1="3" x2="7" y2="7"></line><line x1="7" y1="17" x2="7" y2="21"></line><rect x="4" y="7" width="6" height="10" rx="1"></rect><line x1="17" y1="3" x2="17" y2="7"></line><line x1="17" y1="17" x2="17" y2="21"></line><rect x="14" y="7" width="6" height="10" rx="1"></rect></svg>;
}

// Сервер отдаёт close-точки: агрегируем их в интервалы и честно строим OHLC только из доступных значений
function deriveCandles(points) {
  if (!points.length) return [];
  var chunkSize = Math.max(1, Math.ceil(points.length / 42));
  var candles = [];
  for (var index = 0; index < points.length; index += chunkSize) {
    var chunk = points.slice(index, index + chunkSize);
    var prices = chunk.map(function (point) { return point.price; });
    candles.push({
      time: chunk[chunk.length - 1].time,
      open: chunk[0].price,
      high: Math.max.apply(null, prices),
      low: Math.min.apply(null, prices),
      close: chunk[chunk.length - 1].price
    });
  }
  return candles;
}

function readFavorite(key) {
  try { return localStorage.getItem("xwallet-favorite-" + key) === "1"; } catch (err) { return false; }
}

function AssetBook({ kind, symbol, catalog, portfolio, refreshCatalog, refreshPortfolio, fetchChart, buy, sell }) {
  const navigate = useNavigate();
  var { wallet, refresh: refreshWallet } = useWalletBalance();

  var meta = catalog.find(function (item) { return item.symbol === symbol; });
  var item = meta || { symbol: symbol, name: symbol, color: "#f4f2ec", price: 0, changePercent: 0, changeAmount: 0, unit: "unit" };
  var isStock = kind === "stock";
  var name = item.name || symbol;
  var unit = item.unit || "unit";
  var unitLabel = isStock ? "shares" : unit;
  var holding = portfolio ? (portfolio.holdings || []).find(function (row) { return row.symbol === symbol; }) : null;
  var favoriteKey = kind + "-" + symbol;

  var [range, setRange] = useState("1D");
  var [chartMode, setChartMode] = useState("line");
  var [chartState, setChartState] = useState("loading");
  var [points, setPoints] = useState([]);
  var [favorite, setFavorite] = useState(function () { return readFavorite(favoriteKey); });
  var [ticketOpen, setTicketOpen] = useState(false);
  var [direction, setDirection] = useState("buy");
  var [amount, setAmount] = useState("");
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [status, setStatus] = useState(null);

  var containerRef = useRef(null);
  var chartRef = useRef(null);
  var seriesRef = useRef(null);

  useEffect(function () {
    if (!containerRef.current) return;
    var chart = createChart(containerRef.current, {
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor: "rgba(244,242,236,0.38)",
        fontSize: 10,
        fontFamily: "Archivo, sans-serif",
        attributionLogo: false
      },
      grid: {
        vertLines: { color: "rgba(244,242,236,0.055)", style: 2 },
        horzLines: { color: "rgba(244,242,236,0.075)", style: 2 }
      },
      rightPriceScale: { visible: true, borderVisible: false, scaleMargins: { top: 0.12, bottom: 0.12 } },
      leftPriceScale: { visible: false },
      timeScale: { visible: true, borderVisible: false, timeVisible: true, secondsVisible: false, rightOffset: 2, barSpacing: 7 },
      crosshair: {
        vertLine: { color: "rgba(244,242,236,0.22)", width: 1, style: 2, labelBackgroundColor: "#2a2a2a" },
        horzLine: { color: "rgba(244,242,236,0.16)", width: 1, style: 2, labelBackgroundColor: "#2a2a2a" }
      },
      handleScroll: false,
      handleScale: false,
      autoSize: true
    });
    chartRef.current = chart;
    return function () {
      chartRef.current = null;
      seriesRef.current = null;
      chart.remove();
    };
  }, []);

  useEffect(function () {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      timeScale: {
        tickMarkFormatter: function (time) {
          var date = typeof time === "number" ? new Date(time * 1000) : new Date(time.year, time.month - 1, time.day);
          if (range === "1D" || range === "1W") return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
          if (range === "1Y") return date.toLocaleDateString("en-US", { month: "short" });
          return date.getDate() + " " + date.toLocaleDateString("en-US", { month: "short" });
        }
      }
    });
  }, [range]);

  useEffect(function () {
    var active = true;
    setChartState("loading");
    setPoints([]);
    fetchChart(symbol, range)
      .then(function (rows) {
        if (!active) return;
        var next = (rows || []).map(function (point) {
          return { time: point.time, price: Number(point.price) || 0 };
        }).filter(function (point) { return point.price > 0; });
        setPoints(next);
        setChartState(next.length ? "ready" : "empty");
      })
      .catch(function () { if (active) setChartState("empty"); });
    return function () { active = false; };
  }, [symbol, range, fetchChart]);

  useEffect(function () {
    if (!chartRef.current) return;
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }
    if (!points.length) return;

    var lineData = points.map(function (point) { return { time: point.time, value: point.price }; });
    var rising = lineData.length < 2 || lineData[lineData.length - 1].value >= lineData[0].value;
    var color = rising ? CHART_UP : CHART_DOWN;
    var series;

    if (chartMode === "candles") {
      series = chartRef.current.addSeries(CandlestickSeries, {
        upColor: CHART_UP,
        downColor: CHART_DOWN,
        wickUpColor: CHART_UP,
        wickDownColor: CHART_DOWN,
        borderVisible: false,
        priceLineVisible: false,
        lastValueVisible: true
      });
      series.setData(deriveCandles(points));
    } else {
      series = chartRef.current.addSeries(AreaSeries, {
        lineColor: color,
        topColor: alphaColor(color, 0.2),
        bottomColor: alphaColor(color, 0),
        lineWidth: 2,
        priceLineVisible: true,
        priceLineColor: color,
        priceLineStyle: 2,
        priceLineWidth: 1,
        lastValueVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: color,
        crosshairMarkerBackgroundColor: "#101010"
      });
      series.setData(lineData);
    }
    seriesRef.current = series;
    chartRef.current.timeScale().fitContent();
  }, [points, chartMode]);

  var usdAmount = parseFloat(amount) || 0;
  var estimate = item.price > 0 ? usdAmount / item.price : 0;
  var availableUsd = direction === "sell" ? (holding ? Number(holding.currentValue) || 0 : 0) : Number(wallet.balance) || 0;
  var insufficient = usdAmount > availableUsd;
  var presets = direction === "sell"
    ? [{ key: "25", label: "25%", value: availableUsd * 0.25 }, { key: "50", label: "50%", value: availableUsd * 0.5 }, { key: "75", label: "75%", value: availableUsd * 0.75 }, { key: "max", label: "Max", value: availableUsd }]
    : [{ key: "50", label: "$50", value: 50 }, { key: "100", label: "$100", value: 100 }, { key: "250", label: "$250", value: 250 }, { key: "max", label: "Max", value: availableUsd }];

  function toggleFavorite() {
    var next = !favorite;
    setFavorite(next);
    try { localStorage.setItem("xwallet-favorite-" + favoriteKey, next ? "1" : "0"); } catch (err) {}
  }

  function openTicket(nextDirection) {
    setDirection(nextDirection);
    setAmount("");
    setStatus(null);
    setTicketOpen(true);
  }

  function changeDirection(nextDirection) {
    setDirection(nextDirection);
    setAmount("");
    setStatus(null);
  }

  function handleAmountChange(event) {
    var next = event.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
    var parts = next.split(".");
    if (parts.length > 2) next = parts[0] + "." + parts.slice(1).join("");
    setAmount(next);
  }

  async function handleSubmit() {
    if (usdAmount <= 0 || insufficient || isSubmitting || item.price <= 0) return;
    setIsSubmitting(true);
    setStatus(null);
    try {
      if (direction === "buy") {
        var buyResult = await buy(symbol, usdAmount);
        setStatus({ ok: true, text: "Bought " + fmtQty(buyResult.quantity) + " " + unitLabel });
      } else {
        var sellResult = await sell(symbol, usdAmount);
        setStatus({ ok: true, text: "Sold " + fmtQty(sellResult.quantity) + " " + unitLabel + " \u00B7 " + signedUsd(sellResult.realizedPnl) });
      }
      setAmount("");
      refreshCatalog();
      refreshPortfolio();
      refreshWallet();
    } catch (err) {
      setStatus({ ok: false, text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mkt-page mkt-asset-page">
      <header className="mkt-asset-nav">
        <button className="mkt-back" onClick={function () { navigate(-1); }} aria-label="Back"><IconBack /></button>
        <span>{isStock ? "Stock" : "Resource"}</span>
        <button className={"mkt-favorite" + (favorite ? " is-active" : "")} onClick={toggleFavorite} aria-label={favorite ? "Remove from favorites" : "Add to favorites"} aria-pressed={favorite}><StarIcon filled={favorite} /></button>
      </header>

      <section className="mkt-asset-identity">
        <span className="mkt-asset-avatar"><AssetLogo code={symbol} label={name} /></span>
        <div><h1>{name}</h1><span>{symbol}{!isStock ? " \u00B7 per " + unit : " \u00B7 USD"}</span></div>
      </section>

      <section className="mkt-price-block">
        <span className="mkt-price">{fmtPrice(item.price)}</span>
        <div><span className={"mkt-price-change " + toneOf(item.changePercent)}>{signedPct(item.changePercent)}</span><span className={toneOf(item.changePercent)}>{signedUsd(item.changeAmount)} today</span></div>
      </section>

      <div className="mkt-chart-toolbar">
        <div className="mkt-ranges" role="tablist" aria-label="Chart range">
          {RANGES.map(function (option) {
            return <button key={option} role="tab" aria-selected={range === option} className={range === option ? "is-active" : ""} onClick={function () { setRange(option); }}>{option}</button>;
          })}
        </div>
        <div className="mkt-chart-modes" role="tablist" aria-label="Chart type">
          <button role="tab" aria-selected={chartMode === "line"} className={chartMode === "line" ? "is-active" : ""} onClick={function () { setChartMode("line"); }} aria-label="Line chart"><IconChart /><span>Line</span></button>
          <button role="tab" aria-selected={chartMode === "candles"} className={chartMode === "candles" ? "is-active" : ""} onClick={function () { setChartMode("candles"); }} aria-label="Candlestick chart"><CandleIcon /><span>Candles</span></button>
        </div>
      </div>

      <div className="mkt-chart">
        <div className="mkt-chart-canvas" ref={containerRef}></div>
        {chartState !== "ready" && <div className={"mkt-chart-note" + (chartState === "loading" ? " is-loading" : "")}>{chartState === "loading" ? "Loading market data" : "Chart data is unavailable"}</div>}
      </div>

      <section className="mkt-position-card">
        <div className="mkt-card-head"><h2>Your position</h2>{holding ? <span className={toneOf(holding.unrealizedPnl)}>{signedUsd(holding.unrealizedPnl)}</span> : <span>Not owned</span>}</div>
        {holding ? (
          <div className="mkt-position-stats">
            <div><span>Quantity</span><b>{fmtQty(holding.quantity)}</b><small>{unitLabel}</small></div>
            <div><span>Average cost</span><b>{fmtPrice(holding.avgCost)}</b><small>per {isStock ? "share" : unit}</small></div>
            <div><span>Market value</span><b>{fmtUsd(holding.currentValue)}</b><small>{signedPct(holding.unrealizedPnlPercent)} P&amp;L</small></div>
          </div>
        ) : (
          <div className="mkt-no-position"><span>You do not own {name} yet.</span><b>{fmtUsd(wallet.balance)} available</b></div>
        )}
      </section>

      <section className="mkt-details-card">
        <div className="mkt-card-head"><h2>Asset details</h2></div>
        <div><span>Market</span><b>{isStock ? "Stocks" : "Resources"}</b></div>
        <div><span>Trading unit</span><b>{isStock ? "Shares" : unit}</b></div>
        <div><span>Order type</span><b>Market</b></div>
        <div><span>Settlement</span><b>Instant</b></div>
      </section>

      <div className="mkt-trade-dock">
        <button type="button" className="mkt-dock-sell" disabled={!holding} onClick={function () { openTicket("sell"); }}>Sell</button>
        <button type="button" className="mkt-dock-buy" onClick={function () { openTicket("buy"); }}>Buy {isStock ? symbol : name}</button>
      </div>

      {ticketOpen && (
        <div className="mkt-ticket-backdrop" onClick={function () { if (!isSubmitting) setTicketOpen(false); }}>
          <section className="mkt-ticket" role="dialog" aria-modal="true" aria-label={(direction === "buy" ? "Buy " : "Sell ") + name} onClick={function (event) { event.stopPropagation(); }}>
            <span className="mkt-sheet-handle"></span>
            <div className="mkt-ticket-head"><div><span>{direction === "buy" ? "Buy" : "Sell"}</span><h2>{name}</h2></div><button onClick={function () { setTicketOpen(false); }} aria-label="Close trade ticket">{"\u00D7"}</button></div>
            <div className="mkt-dir" data-direction={direction}>
              <button className={direction === "buy" ? "is-active" : ""} onClick={function () { changeDirection("buy"); }}>Buy</button>
              <button className={direction === "sell" ? "is-active" : ""} onClick={function () { changeDirection("sell"); }}>Sell</button>
            </div>
            <label className="mkt-amount-label">Amount in USD</label>
            <div className="mkt-amount-row"><span>$</span><input type="text" inputMode="decimal" autoComplete="off" placeholder="0" value={amount} onChange={handleAmountChange} aria-label="Amount in US dollars" /></div>
            <div className="mkt-amount-meta"><span>{usdAmount > 0 ? "\u2248 " + fmtQty(estimate) + " " + unitLabel : "Live market price"}</span><span>Available {fmtUsd(availableUsd)}</span></div>
            <div className="mkt-chips">{presets.map(function (preset) {
              return <button key={preset.key} onClick={function () { var value = Math.floor(preset.value * 100) / 100; setAmount(value > 0 ? value.toFixed(2) : ""); }}>{preset.label}</button>;
            })}</div>
            {insufficient && usdAmount > 0 && <div className="mkt-alert">Insufficient {direction === "sell" ? "position" : "balance"}</div>}
            {status && <div className={"mkt-status " + (status.ok ? "ok" : "err")}>{status.text}</div>}
            <button className={"mkt-submit is-" + direction} disabled={usdAmount <= 0 || insufficient || isSubmitting || item.price <= 0} onClick={handleSubmit}>
              {isSubmitting ? "Processing\u2026" : (direction === "buy" ? "Buy " : "Sell ") + (isStock ? symbol : name)}
            </button>
            <p>{direction === "buy" ? "You receive" : "You sell"} <b>{usdAmount > 0 ? fmtQty(estimate) + " " + unitLabel : "\u2014"}</b></p>
          </section>
        </div>
      )}
    </div>
  );
}

function StockAsset({ symbol }) {
  var { catalog, refresh: refreshCatalog } = useStockCatalog();
  var { portfolio, refresh: refreshPortfolio } = useStockPortfolio();
  return <AssetBook kind="stock" symbol={symbol} catalog={catalog} portfolio={portfolio} refreshCatalog={refreshCatalog} refreshPortfolio={refreshPortfolio} fetchChart={fetchStockChart} buy={buyStock} sell={sellStock} />;
}

function ResourceAsset({ symbol }) {
  var { catalog, refresh: refreshCatalog } = useCommodityCatalog();
  var { portfolio, refresh: refreshPortfolio } = useCommodityPortfolio();
  return <AssetBook kind="resource" symbol={symbol} catalog={catalog} portfolio={portfolio} refreshCatalog={refreshCatalog} refreshPortfolio={refreshPortfolio} fetchChart={fetchCommodityChart} buy={buyCommodity} sell={sellCommodity} />;
}

const MarketAsset = () => {
  const location = useLocation();
  var state = location.state || {};
  var isResource = state.kind === "resource";
  var symbol = state.symbol || (isResource ? "GC=F" : "AAPL");
  return isResource ? <ResourceAsset symbol={symbol} /> : <StockAsset symbol={symbol} />;
};

export default MarketAsset;
