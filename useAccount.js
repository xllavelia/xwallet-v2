import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useAccount() {
  var [account, setAccount] = useState(null);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/auth/me")
      .then(function (data) { setAccount(data); setIsLoading(false); })
      .catch(function () { setIsLoading(false); });
  }, []);

  useEffect(function () { refresh(); }, [refresh]);

  return { account: account, isLoading: isLoading, refresh: refresh };
}

async function updateUsername(username) {
  return authFetch("/auth/update-username", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username })
  });
}
async function changePassword(currentPassword, newPassword) {
  return authFetch("/auth/change-password", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
  });
}
async function deleteAccount() {
  return authFetch("/auth/delete-account", { method: "DELETE" });
}

export { useAccount, updateUsername, changePassword, deleteAccount };