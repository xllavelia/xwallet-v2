import { useState, useEffect, useCallback, useRef } from "react";
import { authFetch } from "./apiClient";

// Хук состояния слотов: поллинг /slots/state + отправка действий.
// Ответом на каждое успешное действие бэкенд возвращает свежее состояние.
function useSlots() {
  var [state, setState] = useState(null);
  var [busy, setBusy] = useState(false);
  var stateAtRef = useRef(0);

  var refresh = useCallback(function () {
    return authFetch("/slots/state").then(function (data) {
      stateAtRef.current = Date.now();
      setState(data);
    });
  }, []);

  useEffect(function () {
    refresh().catch(function () {});
    var iv = setInterval(function () {
      refresh().catch(function () {});
    }, 5000);
    return function () { clearInterval(iv); };
  }, [refresh]);

  // Локально отрисовать счётчик спинов до ответа сервера (чтобы поллинг не «откатывал» его во время анимации)
  var setSpinsLocal = useCallback(function (n) {
    setState(function (s) {
      if (!s) return s;
      return Object.assign({}, s, { spins: n });
    });
  }, []);

  var act = useCallback(function (action, payload) {
    setBusy(true);
    return authFetch("/slots/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    })
      .then(function (data) {
        stateAtRef.current = Date.now();
        setState(data);
        return data;
      })
      .finally(function () { setBusy(false); });
  }, []);

  return {
    state: state,
    busy: busy,
    refresh: refresh,
    act: act,
    setSpinsLocal: setSpinsLocal,
    stateAtRef: stateAtRef
  };
}

export { useSlots };