import { useState, useEffect, useCallback, useRef } from "react";
import { authFetch } from "./apiClient";

function useRewards() {
  var [state, setState] = useState(null);
  var [claiming, setClaiming] = useState(false);
  var stateAtRef = useRef(0);

  var refresh = useCallback(function () {
    return authFetch("/rewards/state").then(function (data) {
      stateAtRef.current = Date.now();
      setState(data);
    });
  }, []);

  useEffect(function () {
    refresh().catch(function () {});
    var iv = setInterval(function () {
      refresh().catch(function () {});
    }, 30000);
    return function () { clearInterval(iv); };
  }, [refresh]);

  var claim = useCallback(function () {
    setClaiming(true);
    return authFetch("/rewards/claim", { method: "POST" })
      .then(function (result) {
        return refresh().then(function () { return result; });
      })
      .finally(function () {
        setClaiming(false);
      });
  }, [refresh]);

  return {
    state: state,
    claiming: claiming,
    refresh: refresh,
    claim: claim,
    stateAtRef: stateAtRef
  };
}

export { useRewards };