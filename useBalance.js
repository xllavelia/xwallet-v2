import { useState, useEffect } from "react";

var BALANCE_KEY   = "trading_balance";
var POSITION_KEY  = "trading_position";
var HISTORY_KEY   = "trading_history";
var DEFAULT_BALANCE = 100.00;

function readBalance() {
  var s = localStorage.getItem(BALANCE_KEY);
  return s !== null ? parseFloat(s) : DEFAULT_BALANCE;
}
function writeBalance(val) {
  localStorage.setItem(BALANCE_KEY, String(val));
  window.dispatchEvent(new Event("balance_update"));
}

function readPosition() {
  var s = localStorage.getItem(POSITION_KEY);
  if (!s) return null;
  try { return JSON.parse(s); } catch (e) { return null; }
}
function writePosition(pos) {
  if (pos === null) { localStorage.removeItem(POSITION_KEY); }
  else { localStorage.setItem(POSITION_KEY, JSON.stringify(pos)); }
  window.dispatchEvent(new Event("position_update"));
}

function readHistory() {
  var s = localStorage.getItem(HISTORY_KEY);
  if (!s) return [];
  try { return JSON.parse(s); } catch (e) { return []; }
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

function resetAll() {
  writeBalance(DEFAULT_BALANCE);
  writePosition(null);
  writeHistory([]);
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

function usePosition() {
  var pair = useState(readPosition());
  var position = pair[0];
  var setPosition = pair[1];
  useEffect(function() {
    function onUpdate() { setPosition(readPosition()); }
    window.addEventListener("position_update", onUpdate);
    return function() { window.removeEventListener("position_update", onUpdate); };
  }, []);
  return position;
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

export {
  useBalance, usePosition, useTradeHistory,
  writeBalance, writePosition, writeHistory, addClosedTrade,
  readBalance, readPosition, readHistory,
  resetAll
};