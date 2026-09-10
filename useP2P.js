import { useState, useEffect, useCallback } from "react";
import { authFetch } from "./apiClient";

function useP2PListings(side, filters) {
  var [listings, setListings] = useState([]);
  var [isLoading, setIsLoading] = useState(true);

  var refresh = useCallback(function () {
    var params = new URLSearchParams();
    params.set("side", side);
    if (filters.assetClass) params.set("assetClass", filters.assetClass);
    if (filters.asset) params.set("asset", filters.asset);
    if (filters.amountUsd) params.set("amountUsd", filters.amountUsd);
    if (filters.officialOnly) params.set("official", "true");
    return authFetch("/p2p/listings?" + params.toString())
      .then(function (res) { setListings(res || []); setIsLoading(false); })
      .catch(function () { setIsLoading(false); });
  }, [side, filters.assetClass, filters.asset, filters.amountUsd, filters.officialOnly]);

  useEffect(function () { refresh(); }, [refresh]);

  return { listings: listings, isLoading: isLoading, refresh: refresh };
}

function useMyListings() {
  var [listings, setListings] = useState([]);
  var refresh = useCallback(function () {
    return authFetch("/p2p/my-listings").then(function (res) { setListings(res || []); }).catch(function () {});
  }, []);
  useEffect(function () { refresh(); }, [refresh]);
  return { listings: listings, refresh: refresh };
}

function useMerchantStatus() {
  var [status, setStatus] = useState(null);
  var refresh = useCallback(function () {
    return authFetch("/p2p/merchant/status").then(setStatus).catch(function () {});
  }, []);
  useEffect(function () { refresh(); }, [refresh]);
  return { status: status, refresh: refresh };
}

function useMyDeals(activeOnly) {
  var [deals, setDeals] = useState([]);
  var refresh = useCallback(function () {
    return authFetch("/p2p/deals/my?status=" + (activeOnly ? "active" : "history"))
      .then(function (res) { setDeals(res || []); }).catch(function () {});
  }, [activeOnly]);
  useEffect(function () { refresh(); var iv = setInterval(refresh, 8000); return function () { clearInterval(iv); }; }, [refresh]);
  return { deals: deals, refresh: refresh };
}

async function createListing(payload) {
  return authFetch("/p2p/listings/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
async function closeListing(listingId) {
  return authFetch("/p2p/listings/close", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: listingId }) });
}
async function fetchMarketPrice(assetClass, asset) {
  return authFetch("/p2p/market-price?assetClass=" + assetClass + "&asset=" + asset);
}
async function becomeMerchant() {
  return authFetch("/p2p/merchant/apply", { method: "POST" });
}
async function withdrawMerchantDeposit() {
  return authFetch("/p2p/merchant/withdraw", { method: "POST" });
}
async function createDeal(listingId, quoteAmountUsd) {
  return authFetch("/p2p/deals/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: listingId, quoteAmountUsd: quoteAmountUsd }) });
}
async function confirmDeal(dealId) {
  return authFetch("/p2p/deals/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dealId: dealId }) });
}
async function cancelDeal(dealId) {
  return authFetch("/p2p/deals/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dealId: dealId }) });
}
async function fetchDealDetail(dealId) {
  return authFetch("/p2p/deals/detail?id=" + dealId);
}

export {
  useP2PListings, useMyListings, useMerchantStatus, useMyDeals,
  createListing, closeListing, fetchMarketPrice, becomeMerchant, withdrawMerchantDeposit,
  createDeal, confirmDeal, cancelDeal, fetchDealDetail
};