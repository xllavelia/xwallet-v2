import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useWalletBalance() {
var [wallet, setWallet] = useState({
  balance: 0,
  lavxBalance: 0,
  profit24h: 0,
  profit7d: 0,
  activeTradesCount: 0,
  winRate: 0,
  primeTier: "",
  feeRatePercent: 1.0,
  maxVoucherSlots: 10
});


  var [isLoading, setIsLoading] = useState(true);
  var [error, setError] = useState(null);

  var refresh = useCallback(function () {
    return authFetch("/wallet")
      .then(function (data) {
        setWallet(data);
        setIsLoading(false);
      })
      .catch(function (err) {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(function () {
    refresh();

    var iv = setInterval(refresh, 10000);

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return function () {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh]);

  return { wallet: wallet, isLoading: isLoading, error: error, refresh: refresh };
}

export { useWalletBalance };