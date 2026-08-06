import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useBattlePass() {
  var [data, setData] = useState(null);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/battlepass")
      .then(function (res) { setData(res); setIsLoading(false); })
      .catch(function () { setIsLoading(false); });
  }, []);

  useEffect(function () { refresh(); }, [refresh]);

  return { data: data, isLoading: isLoading, refresh: refresh };
}

async function claimLevel(level) {
  return authFetch("/battlepass/claim", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level: level })
  });
}
async function openCase(rarity) {
  return authFetch("/battlepass/open-case", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rarity: rarity })
  });
}
async function devAddXp(amount) {
  return authFetch("/battlepass/dev-add-xp", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amount })
  });
}
async function devAddCase(rarity) {
  return authFetch("/battlepass/dev-add-case?rarity=" + rarity, { method: "POST" });
}

export { useBattlePass, claimLevel, openCase, devAddXp, devAddCase };