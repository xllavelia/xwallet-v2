import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useStockCatalog() {
  var [catalog, setCatalog] = useState([]);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/stocks/catalog")
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

function useStockPortfolio() {
  var [portfolio, setPortfolio] = useState(null);

  var refresh = useCallback(function () {
    return authFetch("/stocks/portfolio").then(setPortfolio).catch(function () {});
  }, []);

  useEffect(function () {
    refresh();
    var iv = setInterval(refresh, 20000);
    return function () { clearInterval(iv); };
  }, [refresh]);

  return { portfolio: portfolio, refresh: refresh };
}

async function fetchStockChart(symbol, timeframe) {
  return authFetch("/stocks/chart?symbol=" + symbol + "&timeframe=" + timeframe);
}
async function buyStock(symbol, usdAmount) {
  return authFetch("/stocks/buy", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol: symbol, usdAmount: usdAmount })
  });
}
async function sellStock(symbol, usdAmount) {
  return authFetch("/stocks/sell", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol: symbol, usdAmount: usdAmount })
  });
}

export { useStockCatalog, useStockPortfolio, fetchStockChart, buyStock, sellStock };