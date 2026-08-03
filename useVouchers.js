import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useVouchers() {
  var [vouchers, setVouchers] = useState([]);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    return authFetch("/vouchers/list")
      .then(function (data) {
        setVouchers(data || []);
        setIsLoading(false);
      })
      .catch(function () {
        setIsLoading(false);
      });
  }, []);

  useEffect(function () { refresh(); }, [refresh]);

  return { vouchers: vouchers, isLoading: isLoading, refresh: refresh };
}

async function activateVoucher(id) {
  return authFetch("/vouchers/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id })
  });
}

async function deleteVoucher(id) {
  return authFetch("/vouchers/delete?id=" + id, { method: "DELETE" });
}

async function devGrantVoucher(type, amount) {
  return authFetch("/vouchers/dev-grant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: type, amount: amount })
  });
}

async function devResetVouchers() {
  return authFetch("/vouchers/dev-reset", { method: "POST" });
}

export { useVouchers, activateVoucher, deleteVoucher, devGrantVoucher, devResetVouchers };