import { useState, useEffect, useRef, useCallback } from "react";
import { authFetch } from "./apiClient";

export function useMining() {
  var [state, setState] = useState(null);
  var [error, setError] = useState(null);
  var stateAtRef = useRef(Date.now());

  var refresh = useCallback(function () {
    return authFetch("/mining/state").then(function (data) {
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

  function post(path, body) {
    return authFetch(path, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    }).then(refresh);
  }

  function buyServer(catalogId) { return post("/mining/servers/buy", { catalogId: catalogId }); }
  function wakeServer(serverId) { return post("/mining/servers/wake", { serverId: serverId }); }
  function deleteServer(serverId) { return post("/mining/servers/delete", { serverId: serverId }); }
  function upgradeServer(serverId) { return post("/mining/servers/upgrade", { serverId: serverId }); }
  function buyItem(itemType, key) { return post("/mining/items/buy", { itemType: itemType, key: key }); }

  return {
    state: state, error: error, stateAtRef: stateAtRef, refresh: refresh,
    buyServer: buyServer, wakeServer: wakeServer, deleteServer: deleteServer,
    upgradeServer: upgradeServer, buyItem: buyItem
  };
}