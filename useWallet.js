import { useState, useEffect } from "react";
import { authFetch } from "./apiClient";

function useWalletBalance() {
  var [wallet, setWallet] = useState({
    balance: 0,
    profit24h: 0,
    profit7d: 0,
    activeTradesCount: 0,
    winRate: 0
  });
  var [isLoading, setIsLoading] = useState(true);
  var [error, setError] = useState(null);

  useEffect(function () {
    var isMounted = true;

    authFetch("/wallet")
      .then(function (data) {
        if (!isMounted) return;
        setWallet(data);
        setIsLoading(false);
      })
      .catch(function (err) {
        if (!isMounted) return;
        setError(err.message);
        setIsLoading(false);
      });

    return function () { isMounted = false; };
  }, []);

  return { wallet: wallet, isLoading: isLoading, error: error };
}

export { useWalletBalance };