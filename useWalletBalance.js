import { useState, useEffect, useCallback, useRef } from "react";
import { authFetch } from "./apiClient";

var BALANCE_URL = "/api/wallet/balance";

export function useWalletBalance() {
  var [balance, setBalance] = useState(0);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState("");
  var aliveRef = useRef(true);

  var refresh = useCallback(async function () {
    try {
      var res = await authFetch(BALANCE_URL);
      var data = await res.json().catch(function () { return {}; });
      if (!aliveRef.current) {
        return;
      }
      if (res.ok) {
        setBalance(Number(data.balance) || 0);
        setError("");
      } else {
        setError(data.error || "Не удалось загрузить баланс");
      }
    } catch (err) {
      if (aliveRef.current) {
        setError("Нет соединения");
      }
    }
    if (aliveRef.current) {
      setLoading(false);
    }
  }, []);

  useEffect(function () {
    aliveRef.current = true;
    refresh();
    return function () {
      aliveRef.current = false;
    };
  }, [refresh]);

  return { balance: balance, loading: loading, error: error, refresh: refresh };
}