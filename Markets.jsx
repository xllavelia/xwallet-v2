import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStockCatalog, useStockPortfolio } from "./useStocks";
import { useCommodityCatalog, useCommodityPortfolio } from "./useCommodities";
import { useWalletBalance } from "./useWallet";
import {
  fmtUsd,
  fmtPrice,
  fmtQty,
  signedUsd,
  signedPct,
  toneOf,
  IconChevron,
  IconChart,
  IconPlus,
  IconSend,
  IconHistory,
  IconArrow
} from "./marketsShared";
import { AssetLogo } from "./AssetLogos";

function mergeEquityHoldings(stocks, commodities, stockCatalog, commodityCatalog) {
  var stockMeta = {};
  stockCatalog.forEach(function (item) { stockMeta[item.symbol] = item; });
  var commodityMeta = {};
  commodityCatalog.forEach(function (item) { commodityMeta[item.symbol] = item; });
  var list = [];

  ((stocks && stocks.holdings) || []).forEach(function (holding) {
    var meta = stockMeta[holding.symbol] || {};
    list.push({
      key: "stock-" + holding.symbol,
      kind: "stock",
      symbol: holding.symbol,
      title: meta.name || holding.symbol,
      avatar: holding.symbol.slice(0, 2),
      color: holding.color || meta.color || "#f4f2ec",
      qtyText: fmtQty(holding.quantity) + " shares",
      value: Number(holding.currentValue) || 0,
      pnl: Number(holding.unrealizedPnl) || 0
    });
  });

  ((commodities && commodities.holdings) || []).forEach(function (holding) {
    var meta = commodityMeta[holding.symbol] || {};
    var name = holding.name || meta.name || holding.symbol;
    list.push({
      key: "resource-" + holding.symbol,
      kind: "resource",
      symbol: holding.symbol,
      title: name,
      avatar: name.slice(0, 2).toUpperCase(),
      color: holding.color || meta.color || "#f4f2ec",
      qtyText: fmtQty(holding.quantity) + " " + (holding.unit || meta.unit || "units"),
      value: Number(holding.currentValue) || 0,
      pnl: Number(holding.unrealizedPnl) || 0
    });
  });

  return list.sort(function (a, b) { return b.value - a.value; });
}

const Markets = () => {
  const navigate = useNavigate();

  var { portfolio: stocks } = useStockPortfolio();
  var { portfolio: commodities } = useCommodityPortfolio();
  var { catalog: stockCatalog } = useStockCatalog();
  var { catalog: commodityCatalog } = useCommodityCatalog();
  var { wallet } = useWalletBalance();

  var [graceOver, setGraceOver] = useState(false);
  useEffect(function () {
    var timer = setTimeout(function () { setGraceOver(true); }, 2000);
    return function () { clearTimeout(timer); };
  }, []);

  var ready = graceOver || (!!stocks && !!commodities);
  var stockValue = Number(stocks && stocks.totalValue) || 0;
  var commodityValue = Number(commodities && commodities.totalValue) || 0;
  var equityValue = stockValue + commodityValue;
  var equityToday = (Number(stocks && stocks.todayChangeAmount) || 0) + (Number(commodities && commodities.todayChangeAmount) || 0);
  var holdings = mergeEquityHoldings(stocks, commodities, stockCatalog, commodityCatalog);
  var stockShare = equityValue > 0 ? stockValue / equityValue * 100 : 0;
  var resourceShare = equityValue > 0 ? 100 - stockShare : 0;

  var marketItems = stockCatalog.map(function (item) {
    return { kind: "stock", symbol: item.symbol, name: item.name, price: item.price, change: Number(item.changePercent) || 0, color: item.color };
  }).concat(commodityCatalog.map(function (item) {
    return { kind: "resource", symbol: item.symbol, name: item.name, price: item.price, change: Number(item.changePercent) || 0, color: item.color };
  }));
  var movers = marketItems.slice().sort(function (a, b) { return Math.abs(b.change) - Math.abs(a.change); }).slice(0, 4);

  function openAsset(item) {
    navigate("/markets/asset", { state: { kind: item.kind, symbol: item.symbol } });
  }

  return (
    <div className="hub-page">
      <header className="hub-top hub-rise">
        <div><span className="hub-kicker">Stocks & resources</span><h1 className="hub-title">Markets</h1></div>
        <span className="hub-chip">{holdings.length + (holdings.length === 1 ? " position" : " positions")}</span>
      </header>

      <section className="hub-balance hub-rise" style={{ animationDelay: "40ms" }}>
        <div className="hub-balance-main">
          <span className="hub-label">Portfolio value</span>
          <span className={"hub-balance-value" + (ready ? "" : " is-syncing")}>{ready ? fmtUsd(equityValue) : "\u00B7\u00B7\u00B7\u00B7"}</span>
          <div className="hub-balance-meta">
            <span className={"hub-change " + (ready && equityToday !== 0 ? toneOf(equityToday) : "is-quiet")}>{ready && equityToday !== 0 ? signedUsd(equityToday) : "No change today"}</span>
            <span>Across stocks and resources</span>
          </div>
        </div>
        <div className="hub-available"><span>Buying power</span><b>{fmtUsd(wallet.balance)}</b></div>
      </section>

      <div className="hub-actions hub-rise" style={{ animationDelay: "80ms" }}>
        <button type="button" className="is-primary" onClick={function () { navigate("/markets/trade"); }}><IconChart /><span>Explore</span></button>
        <button type="button" onClick={function () { navigate("/balancecard?account=wallet"); }}><IconPlus /><span>Add cash</span></button>
        <button type="button" onClick={function () { navigate("/send"); }}><IconSend /><span>Send</span></button>
        <button type="button" onClick={function () { navigate("/history"); }}><IconHistory /><span>History</span></button>
      </div>

      <section className="hub-section hub-rise" style={{ animationDelay: "120ms" }}>
        <div className="hub-section-head"><div><span className="hub-kicker">Price action</span><h2>Market pulse</h2></div><span className="hub-live"><i></i> Live</span></div>
        <div className="hub-market-grid">
          {movers.map(function (item) {
            return (
              <button type="button" key={item.kind + item.symbol} onClick={function () { openAsset(item); }}>
                <span className="hub-market-symbol"><i><AssetLogo code={item.symbol} label={item.name} /></i>{item.symbol}</span>
                <b>{fmtPrice(item.price)}</b>
                <span className={"hub-row-side " + toneOf(item.change)}>{signedPct(item.change)}<small>24h</small></span>
              </button>
            );
          })}
          {movers.length === 0 && <div className="hub-empty"><b>Market is syncing</b><span>Prices will appear in a moment.</span></div>}
        </div>
      </section>

      <section className="hub-allocation hub-rise" style={{ animationDelay: "160ms" }}>
        <div className="hub-section-head"><div><span className="hub-kicker">Exposure</span><h2>Allocation</h2></div><span>{fmtUsd(equityValue)}</span></div>
        <div className="hub-equity-bar"><i style={{ width: stockShare + "%" }}></i><i style={{ width: resourceShare + "%" }}></i></div>
        <div className="hub-equity-legend">
          <div><span><i></i>Stocks</span><b>{stockShare.toFixed(0)}% <small>{fmtUsd(stockValue)}</small></b></div>
          <div><span><i></i>Resources</span><b>{resourceShare.toFixed(0)}% <small>{fmtUsd(commodityValue)}</small></b></div>
        </div>
      </section>

      <section className="hub-section hub-rise" style={{ animationDelay: "200ms" }}>
        <div className="hub-section-head">
          <div><span className="hub-kicker">Your portfolio</span><h2>Open positions</h2></div>
          <button type="button" className="hub-more" onClick={function () { navigate("/markets/trade"); }}>Trade <IconChevron /></button>
        </div>
        <div className="hub-list-card">
          {ready && holdings.length > 0 ? holdings.slice(0, 4).map(function (holding) {
            return (
              <button type="button" className="hub-asset-row" key={holding.key} onClick={function () { openAsset(holding); }}>
                <span className="hub-avatar"><AssetLogo code={holding.symbol} label={holding.title} /></span>
                <span className="hub-row-main"><span className="hub-row-title">{holding.title}<small>{holding.symbol}</small></span><span className="hub-row-sub">{holding.qtyText}</span></span>
                <span className="hub-row-right"><span className="hub-row-value">{fmtUsd(holding.value)}</span><span className={"hub-row-side " + toneOf(holding.pnl)}>{signedUsd(holding.pnl)}</span></span>
              </button>
            );
          }) : (
            <div className="hub-empty"><b>{ready ? "No open positions" : "Syncing portfolio"}</b><span>{ready ? "Explore the market and make your first trade." : "Your holdings will appear here."}</span></div>
          )}
        </div>
      </section>

      <button type="button" className="hub-explore hub-rise" style={{ animationDelay: "240ms" }} onClick={function () { navigate("/markets/trade"); }}>
        <span><b>Discover the full market</b><small>{stockCatalog.length + " stocks \u00B7 " + commodityCatalog.length + " resources"}</small></span><IconArrow />
      </button>
    </div>
  );
};

export default Markets;
