import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useBankCards() {
  var [data, setData] = useState(null);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/bankcards")
      .then(function (res) { setData(res); setIsLoading(false); })
      .catch(function () { setIsLoading(false); });
  }, []);

  useEffect(function () { refresh(); }, [refresh]);

  return { data: data, isLoading: isLoading, refresh: refresh };
}

async function openCard(tier) {
  return authFetch("/bankcards/open", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier: tier }) });
}
async function topUpCard(cardId, amount) {
  return authFetch("/bankcards/topup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cardId: cardId, amount: amount }) });
}
async function selectActiveCard(cardId) {
  return authFetch("/bankcards/select-active", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cardId: cardId }) });
}
async function closeCard(cardId) {
  return authFetch("/bankcards/close", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cardId: cardId }) });
}

export { useBankCards, openCard, topUpCard, selectActiveCard, closeCard };