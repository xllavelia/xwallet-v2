import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useCardHistory() {
  var [history, setHistory] = useState([]);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/card/history")
      .then(function (data) {
        setHistory(data || []);
        setIsLoading(false);
      })
      .catch(function () {
        setIsLoading(false);
      });
  }, []);

  useEffect(function () {
    refresh();
  }, [refresh]);

  return { history: history, isLoading: isLoading, refresh: refresh };
}

export { useCardHistory };