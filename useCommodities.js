import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useCommodityCatalog() {
  var [catalog, setCatalog] = useState([]);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/commodities/catalog")
      .then(function (res) { setCatalog(res || []); setIsLoading(false); })
      .catch(function () { setIsLoading(false); });
  }, []);

  useEffect(function () {
    refresh();
    var iv = setInterval(refresh, 20000);
    return function () { clearInterval(iv); };
  }, [refresh]);

  return { catalog: catalog, isLoading: isLoading, refresh: refresh };
}

function useCommodityPortfolio() {
  var [portfolio, setPortfolio] = useState(null);

  var refresh = useCallback(function () {
    return authFetch("/commodities/portfolio").then(setPortfolio).catch(function () {});
  }, []);

  useEffect(function () {
    refresh();
    var iv = setInterval(refresh, 20000);
    return function () { clearInterval(iv); };
  }, [refresh]);

  return { portfolio: portfolio, refresh: refresh };
}

async function fetchCommodityChart(symbol, timeframe) {
  return authFetch("/commodities/chart?symbol=" + encodeURIComponent(symbol) + "&timeframe=" + timeframe);
}
async function buyCommodity(symbol, usdAmount) {
  return authFetch("/commodities/buy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symbol: symbol, usdAmount: usdAmount }) });
}
async function sellCommodity(symbol, usdAmount) {
  return authFetch("/commodities/sell", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symbol: symbol, usdAmount: usdAmount }) });
}

export { useCommodityCatalog, useCommodityPortfolio, fetchCommodityChart, buyCommodity, sellCommodity };