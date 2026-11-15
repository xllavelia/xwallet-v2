import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "./apiClient";

function post(path, payload) {
  return authFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });
}

function moneyChanged() {
  window.dispatchEvent(new Event("xw-accounts-changed"));
}

// Состояние NFT-портфеля: профиль, предметы, активные дропы
export function useNftState() {
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const fetchedAt = useRef(Date.now());

  const refresh = useCallback(function () {
    return authFetch("/nft/state").then(function (data) {
      fetchedAt.current = Date.now();
      setState(data);
      setError("");
      return data;
    }).catch(function (e) {
      setError(e && e.message ? e.message : "Could not load NFTs");
      throw e;
    });
  }, []);

  useEffect(function () {
    refresh().catch(function () {});
    const id = window.setInterval(function () { refresh().catch(function () {}); }, 60000);
    return function () { window.clearInterval(id); };
  }, [refresh]);

  const pendingAt = useCallback(function (now) {
    if (!state) return 0;
    const p = state.profile;
    return p.pending + p.incomeHour * Math.max(0, now - fetchedAt.current) / 3600000;
  }, [state]);

  const act = useCallback(function (path, payload) {
    return post(path, payload).then(function (result) {
      moneyChanged();
      return refresh().catch(function () {}).then(function () { return result; });
    });
  }, [refresh]);

  return {
    state: state,
    error: error,
    refresh: refresh,
    pendingAt: pendingAt,
    collect: function () { return act("/nft/collect"); },
    sell: function (itemId) { return act("/nft/sell", { itemId: itemId }); },
    list: function (itemId, price) { return act("/nft/list", { itemId: itemId, price: price }); },
    unlist: function (itemId) { return act("/nft/unlist", { itemId: itemId }); },
    buyPack: function (packId) { return act("/nft/packs/buy", { packId: packId }); },
    upgrade: function (itemId, templateId) { return act("/nft/upgrade/run", { itemId: itemId, templateId: templateId }); },
    merge: function (templateId, itemIds) {
      return act("/nft/merge/run", itemIds && itemIds.length ? { itemIds: itemIds } : { templateId: templateId });
    }
  };
}

// Маркет: объявления игроков, витрина xwallet и последние продажи
export function useNftMarket() {
  const [market, setMarket] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(function () {
    return authFetch("/nft/market").then(function (data) {
      setMarket(data);
      setError("");
      return data;
    }).catch(function (e) {
      setError(e && e.message ? e.message : "Could not load the market");
      throw e;
    });
  }, []);

  useEffect(function () {
    refresh().catch(function () {});
    const id = window.setInterval(function () { refresh().catch(function () {}); }, 30000);
    return function () { window.clearInterval(id); };
  }, [refresh]);

  const act = useCallback(function (path, payload) {
    return post(path, payload).then(function (result) {
      moneyChanged();
      return refresh().catch(function () {}).then(function () { return result; });
    });
  }, [refresh]);

  return {
    market: market,
    error: error,
    refresh: refresh,
    buyListing: function (listingId) { return act("/nft/buy", { listingId: listingId }); },
    buyGame: function (templateId, maxPrice) { return act("/nft/game/buy", { templateId: templateId, maxPrice: maxPrice }); },
    unlist: function (itemId) { return act("/nft/unlist", { itemId: itemId }); }
  };
}
