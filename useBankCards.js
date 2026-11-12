import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

const ACCOUNTS_CHANGED = "xw-accounts-changed";

function useBankCards() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const response = await authFetch("/bankcards");
      setData(response);
      setError("");
      return response;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 20000);
    window.addEventListener(ACCOUNTS_CHANGED, refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener(ACCOUNTS_CHANGED, refresh);
    };
  }, [refresh]);
  return { data, isLoading, error, refresh };
}

async function mutateAccount(path, body) {
  const result = await authFetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  window.dispatchEvent(new Event(ACCOUNTS_CHANGED));
  return result;
}

function openAccount(name, choice) { return mutateAccount("/bankcards/open", { name, ...choice }); }
function setCardDesign(cardId, choice) { return mutateAccount("/bankcards/design", { cardId, ...choice }); }
// Кошелёк не хранится как карточка, поэтому кастом для него оплачивается отдельно.
function chargeCustomDesign(voucherId) {
  return authFetch("/bankcards/custom/charge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voucherId: Number(voucherId) || 0 }) });
}
function topUpCard(cardId, amount) { return mutateAccount("/bankcards/topup", { cardId, amount }); }
function selectActiveCard(cardId) { return mutateAccount("/bankcards/select-active", { cardId }); }
function withdrawFromCard(cardId, amount) { return mutateAccount("/bankcards/withdraw", { cardId, amount }); }
function closeAccount(cardId) { return mutateAccount("/bankcards/close", { cardId }); }

export { useBankCards, openAccount, setCardDesign, chargeCustomDesign, topUpCard, selectActiveCard, withdrawFromCard, closeAccount, ACCOUNTS_CHANGED };
