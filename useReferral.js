import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useReferral() {
  var [referral, setReferral] = useState(null);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/referral")
      .then(function (data) {
        setReferral(data);
        setIsLoading(false);
      })
      .catch(function () {
        setIsLoading(false);
      });
  }, []);

  useEffect(function () { refresh(); }, [refresh]);

  return { referral: referral, isLoading: isLoading, refresh: refresh };
}

async function devAddRefXP(amount) {
  return authFetch("/referral/dev-add-xp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amount })
  });
}

export { useReferral, devAddRefXP };