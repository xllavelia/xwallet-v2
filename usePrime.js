import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function usePrime() {
  var [status, setStatus] = useState(null);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/prime")
      .then(function (data) {
        setStatus(data);
        setIsLoading(false);
      })
      .catch(function () {
        setIsLoading(false);
      });
  }, []);

  useEffect(function () { refresh(); }, [refresh]);

  return { status: status, isLoading: isLoading, refresh: refresh };
}

async function purchasePrime(tier, billing) {
  return authFetch("/prime/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier: tier, billing: billing })
  });
}

export { usePrime, purchasePrime };