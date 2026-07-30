import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function usePositionsRemote() {
  var [positions, setPositions] = useState([]);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/positions/open-list")
      .then(function (data) {
        setPositions(data || []);
        setIsLoading(false);
      })
      .catch(function () {
        setIsLoading(false);
      });
  }, []);

  useEffect(function () {
    refresh();
    var iv = setInterval(refresh, 10000);
    return function () { clearInterval(iv); };
  }, [refresh]);

  return { positions: positions, isLoading: isLoading, refresh: refresh };
}

async function openPosition(payload) {
  return authFetch("/positions/open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

async function closePosition(id, closePrice) {
  return authFetch("/positions/close?id=" + id, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ closePrice: closePrice })
  });
}

export { usePositionsRemote, openPosition, closePosition };