import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useCard() {
  var [card, setCard] = useState({
    cardNumber: "",
    holder: "",
    validThru: "",
    balanceUsd: 0,
    assets: []
  });
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/card")
      .then(function (data) {
        setCard(data);
        setIsLoading(false);
      })
      .catch(function () {
        setIsLoading(false);
      });
  }, []);

  useEffect(function () {
    refresh();
    var iv = setInterval(refresh, 20000);
    return function () { clearInterval(iv); };
  }, [refresh]);

  return { card: card, isLoading: isLoading, refresh: refresh };
}

async function executeTrade(coin, usdAmount, direction) {
  return authFetch("/tradecoin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coin: coin, usdAmount: usdAmount, direction: direction })
  });
}

async function executeSwap(fromAsset, toAsset, fromAmount) {
  return authFetch("/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromAsset: fromAsset, toAsset: toAsset, fromAmount: fromAmount })
  });
}

export { useCard, executeTrade, executeSwap };