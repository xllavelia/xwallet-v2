import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStockCatalog, useStockPortfolio } from "./useStocks";
import { useCommodityCatalog, useCommodityPortfolio } from "./useCommodities";
import {
  fmtPrice,
  signedPct,
  toneOf,
  IconBack,
  IconSearch,
  IconChevron,
  IconRefresh
} from "./marketsShared";
import { AssetLogo } from "./AssetLogos";

function matchQuery(item, query) {
  if (!query) return true;
  return [item.symbol, item.name, item.unit].join(" ").toLowerCase().indexOf(query) !== -1;
}

function readRecent() {
  try {
    var value = JSON.parse(localStorage.getItem("xwallet-market-recent") || "[]");
    return Array.isArray(value) ? value.slice(0, 4) : [];
  } catch (err) {
    return [];
  }
}

const MarketsTrade = () => {
  const navigate = useNavigate();

  var [tab, setTab] = useState("stocks");
  var [query, setQuery] = useState("");
  var [filter, setFilter] = useState("all");
  var [recent, setRecent] = useState(readRecent);

  var { catalog: stockCatalog, isLoading: stocksLoading, refresh: refreshStocks } = useStockCatalog();
  var { portfolio: stocks } = useStockPortfolio();
  var { catalog: commodityCatalog, isLoading: resourcesLoading, refresh: refreshResources } = useCommodityCatalog();
  var { portfolio: commodities } = useCommodityPortfolio();

  var isStocks = tab === "stocks";
  var catalog = isStocks ? stockCatalog : commodityCatalog;
  var portfolio = isStocks ? stocks : commodities;
  var isLoading = isStocks ? stocksLoading : resourcesLoading;
  var holdings = (portfolio && portfolio.holdings) || [];
  var heldSymbols = holdings.map(function (item) { return item.symbol; });
  var normalizedQuery = query.trim().toLowerCase();

  var allKnown = stockCatalog.map(function (item) { return { kind: "stock", symbol: item.symbol }; })
    .concat(commodityCatalog.map(function (item) { return { kind: "resource", symbol: item.symbol }; }));
  var recentItems = recent.filter(function (entry) {
    return allKnown.some(function (item) { return item.symbol === entry.symbol && item.kind === entry.kind; });
  });

  var popular = catalog.slice().sort(function (a, b) {
    return Math.abs(Number(b.changePercent) || 0) - Math.abs(Number(a.changePercent) || 0);
  }).slice(0, 3);

  var filtered = catalog.filter(function (item) {
    if (!matchQuery(item, normalizedQuery)) return false;
    if (filter === "gainers") return Number(item.changePercent) > 0;
    if (filter === "losers") return Number(item.changePercent) < 0;
    if (filter === "holdings") return heldSymbols.indexOf(item.symbol) !== -1;
    return true;
  });

  function switchTab(nextTab) {
    setTab(nextTab);
    setQuery("");
    setFilter("all");
  }

  function openAsset(symbol, forcedKind) {
    var kind = forcedKind || (isStocks ? "stock" : "resource");
    var next = [{ kind: kind, symbol: symbol }].concat(recent.filter(function (entry) {
      return entry.symbol !== symbol || entry.kind !== kind;
    })).slice(0, 4);
    setRecent(next);
    try { localStorage.setItem("xwallet-market-recent", JSON.stringify(next)); } catch (err) {}
    navigate("/markets/asset", { state: { kind: kind, symbol: symbol } });
  }

  function itemMeta(item) {
    return {
      avatar: isStocks ? item.symbol.slice(0, 2) : item.name.slice(0, 2).toUpperCase(),
      color: item.color || "#f4f2ec",
      sub: isStocks ? item.symbol : item.symbol + " \u00B7 per " + item.unit
    };
  }

  return (
    <div className="mkt-page mkt-trade-page">
      <header className="mkt-head">
        <button className="mkt-back" onClick={function () { navigate(-1); }} aria-label="Back"><IconBack /></button>
        <div className="mkt-head-copy"><span className="mkt-kicker">Discover</span><h1 className="mkt-title">Markets</h1></div>
        <span className="mkt-live"><i></i> Live</span>
      </header>

      <label className="mkt-search">
        <IconSearch />
        <input value={query} onChange={function (event) { setQuery(event.target.value); }} placeholder="Search companies and resources" aria-label="Search markets" />
        {query.length > 0 && <button type="button" className="mkt-search-clear" onClick={function () { setQuery(""); }} aria-label="Clear search">{"\u00D7"}</button>}
      </label>

      <div className="mkt-tabs" role="tablist" aria-label="Market categories">
        <button role="tab" aria-selected={isStocks} className={isStocks ? "is-active" : ""} onClick={function () { switchTab("stocks"); }}>
          <span>Stocks</span><small>{stockCatalog.length + " assets"}</small>
        </button>
        <button role="tab" aria-selected={!isStocks} className={!isStocks ? "is-active" : ""} onClick={function () { switchTab("resources"); }}>
          <span>Resources</span><small>{commodityCatalog.length + " assets"}</small>
        </button>
      </div>

      {!normalizedQuery && filter === "all" && popular.length > 0 && (
        <section className="mkt-section">
          <div className="mkt-section-head"><div><span className="mkt-kicker">In focus</span><h2>Popular choice</h2></div><span>Top price action</span></div>
          <div className="mkt-popular-scroll">
            {popular.map(function (item) {
              var meta = itemMeta(item);
              return (
                <button type="button" className="mkt-popular-card" key={item.symbol} onClick={function () { openAsset(item.symbol); }}>
                  <span className="mkt-popular-top"><i><AssetLogo code={item.symbol} label={item.name} /></i><b className={toneOf(item.changePercent)}>{signedPct(item.changePercent)}</b></span>
                  <span className="mkt-popular-name">{item.name}</span>
                  <span className="mkt-popular-symbol">{meta.sub}</span>
                  <strong>{fmtPrice(item.price)}</strong>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {!normalizedQuery && filter === "all" && recentItems.length > 0 && (
        <section className="mkt-recent">
          <div className="mkt-section-head"><h2>Recently viewed</h2></div>
          <div>{recentItems.map(function (entry) {
            return <button type="button" key={entry.kind + entry.symbol} onClick={function () { openAsset(entry.symbol, entry.kind); }}>{entry.symbol}<IconChevron /></button>;
          })}</div>
        </section>
      )}

      <div className="mkt-filters" role="tablist" aria-label="Filter assets">
        {[["all", "All"], ["gainers", "Gainers"], ["losers", "Losers"], ["holdings", "Holdings"]].map(function (option) {
          return <button key={option[0]} role="tab" aria-selected={filter === option[0]} className={filter === option[0] ? "is-active" : ""} onClick={function () { setFilter(option[0]); }}>{option[1]}</button>;
        })}
      </div>

      <section className="mkt-section mkt-catalog">
        <div className="mkt-section-head">
          <div><span className="mkt-kicker">{isStocks ? "Equities" : "Commodities"}</span><h2>{normalizedQuery ? "Search results" : "Market heatmap"}</h2></div>
          <span>{filtered.length + " shown"}</span>
        </div>

        {isLoading && catalog.length === 0 && (
          <div className="mkt-heat-grid" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map(function (index) { return <span className="mkt-heat-skeleton" key={index}></span>; })}</div>
        )}

        {filtered.length > 0 && (
          <div className="mkt-heat-grid">
            {filtered.map(function (item) {
              var meta = itemMeta(item);
              return (
                <button type="button" className={"mkt-heat-card " + toneOf(item.changePercent)} key={item.symbol} onClick={function () { openAsset(item.symbol); }}>
                  <span className="mkt-heat-top"><i><AssetLogo code={item.symbol} label={item.name} /></i><b>{item.symbol}</b></span>
                  <span className="mkt-heat-name">{item.name}</span>
                  <strong>{fmtPrice(item.price)}</strong>
                  <span className={"mkt-heat-change " + toneOf(item.changePercent)}>{signedPct(item.changePercent)}</span>
                </button>
              );
            })}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="mkt-empty">
            <b>{catalog.length === 0 ? "Markets are offline" : "No assets found"}</b>
            <span>{catalog.length === 0 ? "Prices did not load. Try again in a moment." : "Try another search or filter."}</span>
            <button onClick={catalog.length === 0 ? (isStocks ? refreshStocks : refreshResources) : function () { setQuery(""); setFilter("all"); }}>
              {catalog.length === 0 ? <IconRefresh /> : null}{catalog.length === 0 ? "Retry" : "Reset filters"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default MarketsTrade;
