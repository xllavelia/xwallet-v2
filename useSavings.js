import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useSavings() {
  var [savings, setSavings] = useState(null);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/savings")
      .then(function (data) { setSavings(data); setIsLoading(false); })
      .catch(function () { setIsLoading(false); });
  }, []);

  useEffect(function () { refresh(); }, [refresh]);

  return { savings: savings, isLoading: isLoading, refresh: refresh };
}

async function depositToSavings(amount) {
  return authFetch("/savings/deposit", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amount })
  });
}
async function withdrawFromSavings(amount) {
  return authFetch("/savings/withdraw", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amount })
  });
}

export { useSavings, depositToSavings, withdrawFromSavings };