import { useState, useEffect } from "react";

// ── Keys ─────────────────────────────────────────────────────────────────────
var BALANCE_KEY    = "trading_balance";
var POSITIONS_KEY  = "trading_positions";
var HISTORY_KEY    = "trading_history";
var VOUCHER_KEY    = "voucher_used";
var PROFILE_KEY    = "user_profile";
var ALL_PROFILES   = "all_profiles";
var TRANSFERS_KEY  = "transfer_history";


var DEFAULT_BALANCE  = 0;
var VOUCHER_TOTAL    = 400.00;


// ── Helpers ──────────────────────────────────────────────────────────────────
function dispatch(name) { window.dispatchEvent(new Event(name)); }

function generateId() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var r = "";
  for (var i = 0; i < 5; i++) r = r + chars[Math.floor(Math.random() * chars.length)];
  return r;
}

// ── PROFILE ──────────────────────────────────────────────────────────────────
function readAllProfiles() {
  var s = localStorage.getItem(ALL_PROFILES);
  if (!s) return {};
  try { return JSON.parse(s); } catch (e) { return {}; }
}
function saveAllProfiles(map) {
  localStorage.setItem(ALL_PROFILES, JSON.stringify(map));
}

function readProfile() {
  var s = localStorage.getItem(PROFILE_KEY);
  if (s) { try { return JSON.parse(s); } catch (e) {} }
  var newProfile = { id: generateId(), name: "User" };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
  var all = readAllProfiles();
  all[newProfile.id] = newProfile;
  saveAllProfiles(all);

  // Seed demo profiles once so you can immediately test sends
  if (!all["DEMO1"]) {
    all["DEMO1"] = { id: "DEMO1", name: "Alice Demo" };
    all["DEMO2"] = { id: "DEMO2", name: "Bob Demo" };
    saveAllProfiles(all);
  }
  return newProfile;
}

function writeProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  var all = readAllProfiles();
  all[profile.id] = profile;
  saveAllProfiles(all);
  dispatch("profile_update");
}

function findProfileById(id) {
  var all = readAllProfiles();
  return all[id.toUpperCase()] || null;
}

// ── BALANCE ──────────────────────────────────────────────────────────────────
function readBalance() {
  var s = localStorage.getItem(BALANCE_KEY);
  return s !== null ? parseFloat(s) : DEFAULT_BALANCE;
}
function writeBalance(val) {
  localStorage.setItem(BALANCE_KEY, String(parseFloat(val.toFixed(2))));
  dispatch("balance_update");
}

// ── POSITIONS ─────────────────────────────────────────────────────────────────
function readPositions() {
  var s = localStorage.getItem(POSITIONS_KEY);
  if (!s) return [];
  try { return JSON.parse(s); } catch (e) { return []; }
}
function writePositions(arr) {
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(arr));
  dispatch("positions_update");
}
function addPosition(pos) {
  var arr = readPositions();
  arr.unshift(pos);
  writePositions(arr);
}
function checkAndAutoClose() {
  var arr = readPositions();
  if (arr.length === 0) return;
  arr.forEach(function(pos) {
    if (!pos.liqPrice || !pos.entryPrice || !pos.margin || !pos.leverage) return;
    // Автозакрытие по take profit если autoClose включён
    if (pos.autoClose && pos.autoCloseTarget && pos.entryPrice > 0) {
      // Нельзя проверить без живой цены — пропускаем, Trade сам проверит
    }
    // Ликвидация — если позиция уже давно должна была закрыться
    // Это защита: если maxLoss уже превышен считаем ликвидированной
    var maxLoss = -pos.margin;
    // Без живой цены не можем считать точно, поэтому только useBalance делает clamp
  });
}
function closePositionById(id, closePrice) {
  var arr = readPositions();
  var pos = null;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === id) { pos = arr[i]; break; }
  }
  if (!pos) return;
  var priceMove  = closePrice - pos.entryPrice;
  var direction  = pos.type === "long" ? 1 : -1;
 var pnl        = pos.margin * pos.leverage * (priceMove / pos.entryPrice) * direction;
var clampedPnl = Math.max(pnl, -pos.margin);
var pnlPercent = pos.margin > 0 ? (clampedPnl / pos.margin) * 100 : 0;
var bal        = readBalance();
var newBal     = Math.max(0, parseFloat((bal + pos.margin + clampedPnl).toFixed(2)));
  writeBalance(newBal);
  var newArr = arr.filter(function (p) { return p.id !== id; });
  writePositions(newArr);
  var closedTrade = {
    id:               pos.id,
    tradeId:          pos.tradeId || null,
    coin:             pos.coin,
    type:             pos.type,
    entryPrice:       pos.entryPrice,
    closePrice:       closePrice,
    leverage:         pos.leverage,
    amount:           pos.amount,
    margin:           pos.margin,
    fees:             pos.fees,
    feesPaidByVoucher: pos.feesPaidByVoucher || false,

   pnl:               parseFloat(clampedPnl.toFixed(2)),


pnlPercent:        parseFloat(pnlPercent.toFixed(2)),
liqPrice:          pos.liqPrice,
openTime:          pos.openTime,
closeTime:         Date.now(),
duration:          Date.now() - pos.openTime,
result:            clampedPnl >= 0 ? 'win' : 'loss'
  };
  addClosedTrade(closedTrade);
}

// ── TRADE HISTORY ─────────────────────────────────────────────────────────────
function readHistory() {
  var s = localStorage.getItem(HISTORY_KEY);
  if (!s) return [];
  try { return JSON.parse(s); } catch (e) { return []; }
}
function writeHistory(arr) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
  dispatch("history_update");
}
function addClosedTrade(trade) {
  var arr = readHistory();
  arr.unshift(trade);
  writeHistory(arr);
}

// ── VOUCHER ──────────────────────────────────────────────────────────────────
function readVoucherUsed() {
  var s = localStorage.getItem(VOUCHER_KEY);
  return s !== null ? parseFloat(s) : 0;
}
function writeVoucherUsed(val) {
  localStorage.setItem(VOUCHER_KEY, String(parseFloat(val.toFixed(2))));
  dispatch("voucher_update");
}

// ── TRANSFERS ─────────────────────────────────────────────────────────────────
function readTransfers() {
  var s = localStorage.getItem(TRANSFERS_KEY);
  if (!s) return [];
  try { return JSON.parse(s); } catch (e) { return []; }
}
function writeTransfers(arr) {
  localStorage.setItem(TRANSFERS_KEY, JSON.stringify(arr));
  dispatch("transfers_update");
}

function sendTransfer(toId, amount) {
  var myProfile  = readProfile();
  var upperToId  = toId.toString().toUpperCase();
  if (upperToId === myProfile.id) return { success: false, error: "Cannot send to yourself" };

  var recipient = findProfileById(upperToId);
  if (!recipient) return { success: false, error: "User not found. Check the ID." };

  var amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) return { success: false, error: "Invalid amount" };

  var bal = readBalance();
  if (bal < amt) return { success: false, error: "Insufficient balance" };

  var newBal = parseFloat((bal - amt).toFixed(2));
  writeBalance(newBal);

  var transfer = {
    id:         Date.now(),
    type:       "send",
    fromId:     myProfile.id,
    fromName:   myProfile.name,
    toId:       recipient.id,
    toName:     recipient.name,
    amount:     amt,
    timestamp:  Date.now(),
    status:     "completed"
  };

  var arr = readTransfers();
  arr.unshift(transfer);
  writeTransfers(arr);
  return { success: true, transfer: transfer };
}

// ── RESET ─────────────────────────────────────────────────────────────────────
function resetAll() {
  writeBalance(DEFAULT_BALANCE);
  writePositions([]);
  writeHistory([]);
  writeVoucherUsed(0);
  writeTransfers([]);
}

// ── HOOKS ─────────────────────────────────────────────────────────────────────
function useBalance() {
  var pair = useState(readBalance());
  useEffect(function () {
    function onU() { pair[1](readBalance()); }
    window.addEventListener("balance_update", onU);
    return function () { window.removeEventListener("balance_update", onU); };
  }, []);
  return pair[0];
}

function usePositions() {
  var pair = useState(readPositions());
  useEffect(function () {
    function onU() { pair[1](readPositions()); }
    window.addEventListener("positions_update", onU);
    return function () { window.removeEventListener("positions_update", onU); };
  }, []);
  return pair[0];
}

function useTradeHistory() {
  var pair = useState(readHistory());
  useEffect(function () {
    function onU() { pair[1](readHistory()); }
    window.addEventListener("history_update", onU);
    return function () { window.removeEventListener("history_update", onU); };
  }, []);
  return pair[0];
}

function useVoucherUsed() {
  var pair = useState(readVoucherUsed());
  useEffect(function () {
    function onU() { pair[1](readVoucherUsed()); }
    window.addEventListener("voucher_update", onU);
    return function () { window.removeEventListener("voucher_update", onU); };
  }, []);
  return pair[0];
}

function useProfile() {
  var pair = useState(readProfile());
  useEffect(function () {
    function onU() { pair[1](readProfile()); }
    window.addEventListener("profile_update", onU);
    return function () { window.removeEventListener("profile_update", onU); };
  }, []);
  return pair[0];
}

function useTransfers() {
  var pair = useState(readTransfers());
  useEffect(function () {
    function onU() { pair[1](readTransfers()); }
    window.addEventListener("transfers_update", onU);
    return function () { window.removeEventListener("transfers_update", onU); };
  }, []);
  return pair[0];
}
// ── BACKGROUND LIQUIDATION CHECKER ───────────────────────────────────────────
function startLiquidationChecker() {
  var active = true;

  function tick() {
    if (!active) return;
    var arr = readPositions();
    if (arr.length === 0) {
      setTimeout(tick, 15000);
      return;
    }

    var uniqueCoins = [];
    arr.forEach(function(pos) {
      if (pos.coin && uniqueCoins.indexOf(pos.coin) === -1) uniqueCoins.push(pos.coin);
    });

    var symbols = JSON.stringify(uniqueCoins.map(function(c) { return c + 'USDT'; }));

    fetch('https://api.binance.com/api/v3/ticker/price?symbols=' + symbols)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var prices = {};
        data.forEach(function(item) {
          prices[item.symbol.replace('USDT', '')] = parseFloat(item.price);
        });

        var positions = readPositions();
        positions.forEach(function(pos) {
          if (!pos.entryPrice || pos.entryPrice <= 0) return;
          if (!pos.liqPrice   || pos.liqPrice <= 0)   return;
          if (!pos.margin     || pos.margin <= 0)      return;
          if (!pos.leverage   || pos.leverage <= 0)    return;

          var livePrice = prices[pos.coin];
          if (!livePrice || livePrice <= 0) return;

          var priceMove = livePrice - pos.entryPrice;
          var direction = pos.type === 'long' ? 1 : -1;
          var rawPnl    = pos.margin * pos.leverage * (priceMove / pos.entryPrice) * direction;
          var pnlPct    = (rawPnl / pos.margin) * 100;

          var shouldLiq = pos.type === 'long'
            ? livePrice <= pos.liqPrice
            : livePrice >= pos.liqPrice;

          var deepLoss = pnlPct <= -99.9;

          if (shouldLiq || deepLoss) {
            closePositionById(pos.id, shouldLiq ? pos.liqPrice : livePrice);
            return;
          }

          if (pos.autoClose && pos.autoCloseTarget && pos.autoCloseTarget > 0) {
            if (pnlPct >= pos.autoCloseTarget) {
              closePositionById(pos.id, livePrice);
            }
          }
        });
      })
      .catch(function() {})
      .finally(function() {
        if (active) setTimeout(tick, 15000);
      });
  }

  tick();
  return function() { active = false; };
}

// Запускаем сразу при загрузке модуля — работает на всех страницах
var _stopChecker = startLiquidationChecker();

export {
  useBalance, usePositions, useTradeHistory, useVoucherUsed, useProfile, useTransfers,
  writeBalance, writePositions, addPosition, closePositionById,
  writeHistory, addClosedTrade,
  readBalance, readPositions, readHistory, readVoucherUsed, writeVoucherUsed,
  readProfile, writeProfile, findProfileById,
  readTransfers, writeTransfers, sendTransfer,
  resetAll, VOUCHER_TOTAL
};
