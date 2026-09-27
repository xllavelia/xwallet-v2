import { useState, useEffect, useCallback, useRef } from "react";
import { authFetch } from "./apiClient";

export function useEmpire() {
  var [state, setState] = useState(null);
  var [error, setError] = useState(null);
  var stateAtRef = useRef(Date.now());

  var refresh = useCallback(function () {
    return authFetch("/empire/state").then(function (data) {
      stateAtRef.current = Date.now();
      setState(data);
      setError(null);
      return data;
    }).catch(function (err) {
      setError(err.message);
      throw err;
    });
  }, []);

  useEffect(function () {
    refresh().catch(function () {});
    var iv = setInterval(function () { refresh().catch(function () {}); }, 5000);
    return function () { clearInterval(iv); };
  }, [refresh]);

  // Универсальный вызов действия. Бэкенд на success возвращает свежее полное
  // состояние (уже после Tick), поэтому state обновляем прямо из ответа.
  function act(action, payload) {
    return authFetch("/empire/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    }).then(function (data) {
      stateAtRef.current = Date.now();
      setState(data);
      setError(null);
      return data;
    });
  }

  return {
    state: state,
    error: error,
    stateAtRef: stateAtRef,
    refresh: refresh,
    act: act
  };
}