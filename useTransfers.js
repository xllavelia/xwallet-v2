import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useTransfersRemote() {
  var [transfers, setTransfers] = useState([]);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/transfers/list")
      .then(function (data) {
        setTransfers(data || []);
        setIsLoading(false);
      })
      .catch(function () {
        setIsLoading(false);
      });
  }, []);

  useEffect(function () {
    refresh();
  }, [refresh]);

  return { transfers: transfers, isLoading: isLoading, refresh: refresh };
}

export { useTransfersRemote };