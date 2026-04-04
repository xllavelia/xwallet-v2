import { useState, useEffect } from "react";

var BALANCE_KEY   = "trading_balance";
var POSITIONS_KEY = "trading_positions";
var HISTORY_KEY   = "trading_history";
var VOUCHER_KEY   = "voucher_used";
var DEFAULT_BALANCE = 100.00;
var VOUCHER_TOTAL = 100.00;

function readBalance() {
  var s = localStorage.getItem(BALANCE_KEY);
  return s !== null ? parseFloat(s) : DEFAULT_BALANCE;
}
function writeBalance(val) {
  localStorage.setItem(BALANCE_KEY, String(parseFloat(val.toFixed(2))));
  window.dispatchEvent(new Event("balance_update"));
}

function readPositions() {
  var s = localStorage.getItem(POSITIONS_KEY);
  if (!s) return [];
  try { return JSON.parse(s); } catch(e) { return []; }
}
function writePositions(arr) {
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(arr));
  window.dispatchEvent(new Event("positions_update"));
}
function addPosition(pos) {
  var arr = readPositions();
  arr.unshift(pos);
  writePositions(arr);
}
function closePositionById(id, closePrice) {
  var arr = readPositions();
  var pos = null;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === id) { pos = arr[i]; break; }
  }
  if (!pos) return;
  var priceMove = closePrice - pos.entryPrice;
  var direction = pos.type === 'long' ? 1 : -1;
  var pnl = pos.margin * pos.leverage * (priceMove / pos.entryPrice) * direction;
  var pnlPercent = (pnl / pos.margin) * 100;
  var bal = readBalance();
var maxLoss = -pos.margin;
var clampedPnl = Math.max(pnl, maxLoss);
var newBal = Math.max(0, parseFloat((bal + pos.margin + clampedPnl).toFixed(2)));
  writeBalance(newBal);
  var newArr = arr.filter(function(p) { return p.id !== id; });
  writePositions(newArr);
  var closedTrade = {
    id: pos.id,
    coin: pos.coin,
    type: pos.type,
    entryPrice: pos.entryPrice,
    closePrice: closePrice,
    leverage: pos.leverage,
    amount: pos.amount,
    margin: pos.margin,
    fees: pos.fees,
    feesPaidByVoucher: pos.feesPaidByVoucher || false,
   pnl: parseFloat(clampedPnl.toFixed(2)),
    pnlPercent: parseFloat(pnlPercent.toFixed(2)),
    liqPrice: pos.liqPrice,
    openTime: pos.openTime,
    closeTime: Date.now(),
    duration: Date.now() - pos.openTime,
    result: pnl >= 0 ? 'win' : 'loss'
  };
  addClosedTrade(closedTrade);
}

function readHistory() {
  var s = localStorage.getItem(HISTORY_KEY);
  if (!s) return [];
  try { return JSON.parse(s); } catch(e) { return []; }
}
function writeHistory(arr) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
  window.dispatchEvent(new Event("history_update"));
}
function addClosedTrade(trade) {
  var arr = readHistory();
  arr.unshift(trade);
  writeHistory(arr);
}

function readVoucherUsed() {
  var s = localStorage.getItem(VOUCHER_KEY);
  return s !== null ? parseFloat(s) : 0;
}
function writeVoucherUsed(val) {
  localStorage.setItem(VOUCHER_KEY, String(parseFloat(val.toFixed(2))));
  window.dispatchEvent(new Event("voucher_update"));
}

function resetAll() {
  writeBalance(DEFAULT_BALANCE);
  writePositions([]);
  writeHistory([]);
  writeVoucherUsed(0);
}

function useBalance() {
  var pair = useState(readBalance());
  var balance = pair[0];
  var setBalance = pair[1];
  useEffect(function() {
    function onUpdate() { setBalance(readBalance()); }
    window.addEventListener("balance_update", onUpdate);
    return function() { window.removeEventListener("balance_update", onUpdate); };
  }, []);
  return balance;
}

function usePositions() {
  var pair = useState(readPositions());
  var positions = pair[0];
  var setPositions = pair[1];
  useEffect(function() {
    function onUpdate() { setPositions(readPositions()); }
    window.addEventListener("positions_update", onUpdate);
    return function() { window.removeEventListener("positions_update", onUpdate); };
  }, []);
  return positions;
}

function useTradeHistory() {
  var pair = useState(readHistory());
  var history = pair[0];
  var setHistory = pair[1];
  useEffect(function() {
    function onUpdate() { setHistory(readHistory()); }
    window.addEventListener("history_update", onUpdate);
    return function() { window.removeEventListener("history_update", onUpdate); };
  }, []);
  return history;
}

function useVoucherUsed() {
  var pair = useState(readVoucherUsed());
  var used = pair[0];
  var setUsed = pair[1];
  useEffect(function() {
    function onUpdate() { setUsed(readVoucherUsed()); }
    window.addEventListener("voucher_update", onUpdate);
    return function() { window.removeEventListener("voucher_update", onUpdate); };
  }, []);
  return used;
}

export {
  useBalance, usePositions, useTradeHistory, useVoucherUsed,
  writeBalance, writePositions, addPosition, closePositionById,
  writeHistory, addClosedTrade,
  readBalance, readPositions, readHistory, readVoucherUsed, writeVoucherUsed,
  resetAll, VOUCHER_TOTAL
};