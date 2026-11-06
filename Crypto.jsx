import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCard } from "./useCard";
import { useCardHistory } from "./useCardHistory";
import { useWalletBalance } from "./useWallet";
import {
  COIN_ORDER,
  COIN_META,
  fmtUsd,
  fmtPrice,
  fmtQty,
  signedUsd,
  signedPct,
  toneOf,
  IconChevron,
  IconSwap,
  IconBuy,
  IconSell,
  IconSend,
  IconCard
} from "./marketsShared";
import { AssetLogo } from "./AssetLogos";

var PULSE_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "TONUSDT"];

// Курсы и суточное движение берём с публичной биржи — тот же источник, что у Swap
function useCryptoPulse() {
  var [pulse, setPulse] = useState({});

  useEffect(function () {
    var active = true;

    function load() {
      fetch("https://api.binance.com/api/v3/ticker/24hr?symbols=" + encodeURIComponent(JSON.stringify(PULSE_SYMBOLS)))
        .then(function (res) { return res.json(); })
        .then(function (rows) {
          if (!active || !Array.isArray(rows)) return;
          var next = {};
          rows.forEach(function (row) {
            var coin = String(row.symbol || "").replace("USDT", "");
            next[coin] = {
              price: parseFloat(row.lastPrice) || 0,
              change: parseFloat(row.priceChangePercent) || 0
            };
          });
          setPulse(next);
        })
        .catch(function () {});
    }

    load();
    var iv = setInterval(load, 30000);
    return function () { active = false; clearInterval(iv); };
  }, []);

  return pulse;
}

function fmtWhen(iso) {
  var date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  var day = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  var time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return day + " \u00B7 " + time;
}

function activityTitle(entry) {
  if (entry.operationType === "buy") return "Bought " + entry.toAsset;
  if (entry.operationType === "sell") return "Sold " + entry.fromAsset;
  return entry.fromAsset + " \u2192 " + entry.toAsset;
}

function activityCoin(entry) {
  if (entry.operationType === "sell") return entry.fromAsset;
  return entry.toAsset;
}

const Crypto = () => {
  const navigate = useNavigate();

  var { card, isLoading } = useCard();
  var { history } = useCardHistory();
  var { wallet } = useWalletBalance();
  var pulse = useCryptoPulse();

  // Не держим «····» вечно, если сервер молчит
  var [graceOver, setGraceOver] = useState(false);
  useEffect(function () {
    var timer = setTimeout(function () { setGraceOver(true); }, 2000);
    return function () { clearTimeout(timer); };
  }, []);

  var ready = !isLoading || graceOver;
  var total = Number(card.balanceUsd) || 0;
  var available = card.usdtBalance != null ? Number(card.usdtBalance) || 0 : Number(wallet.balance) || 0;
  var heldAssets = (card.assets || []).filter(function (asset) {
    return (Number(asset.amount) || 0) > 0 || (Number(asset.valueUsd) || 0) > 0;
  });

  var change = 0;
  var hasPulse = false;
  heldAssets.forEach(function (asset) {
    var live = pulse[asset.id];
    if (!live || !live.change || 1 + live.change / 100 <= 0) return;
    hasPulse = true;
    var value = Number(asset.valueUsd) || 0;
    change += value - value / (1 + live.change / 100);
  });
  var changeBase = total - change;
  var changePct = changeBase > 0 ? change / changeBase * 100 : 0;
  var btcPrice = pulse.BTC ? pulse.BTC.price : 0;
  var btcEquiv = btcPrice > 0 ? total / btcPrice : 0;
  var last4 = (card.cardNumber || "").slice(-4);
  var entries = (history || []).slice(0, 3);

  function openCoin(coin, direction) {
    navigate("/tradecoin", { state: { direction: direction || "buy", coin: coin } });
  }

  return (
    <div className="hub-page">
      <header className="hub-top hub-rise">
        <div>
          <span className="hub-kicker">Digital assets</span>
          <h1 className="hub-title">Crypto</h1>
        </div>
        <span className="hub-chip"><IconCard />{"\u00B7\u00B7\u00B7\u00B7 " + (last4 || "\u2014\u2014")}</span>
      </header>

      <section className="hub-balance hub-rise" style={{ animationDelay: "40ms" }}>
        <div className="hub-balance-main">
          <span className="hub-label">Total balance</span>
          <span className={"hub-balance-value" + (ready ? "" : " is-syncing")}>{ready ? fmtUsd(total) : "\u00B7\u00B7\u00B7\u00B7"}</span>
          <div className="hub-balance-meta">
            {ready && hasPulse && change !== 0 ? (
              <span className={"hub-change " + toneOf(change)}>{signedUsd(change)} <i>{signedPct(changePct)}</i></span>
            ) : <span className="hub-change is-quiet">Live portfolio</span>}
            <span>{btcEquiv > 0 ? "\u2248 " + fmtQty(btcEquiv) + " BTC" : "BTC \u00B7 ETH \u00B7 SOL \u00B7 TON"}</span>
          </div>
        </div>
        <div className="hub-available">
          <span>Available to trade</span>
          <b>{ready ? fmtUsd(available) : "\u2014"}</b>
        </div>
      </section>

      <div className="hub-actions hub-rise" style={{ animationDelay: "80ms" }}>
        <button type="button" className="is-primary" onClick={function () { navigate("/swap"); }}><IconSwap /><span>Swap</span></button>
        <button type="button" onClick={function () { navigate("/tradecoin", { state: { direction: "buy" } }); }}><IconBuy /><span>Buy</span></button>
        <button type="button" onClick={function () { navigate("/tradecoin", { state: { direction: "sell" } }); }}><IconSell /><span>Sell</span></button>
        <button type="button" onClick={function () { navigate("/send"); }}><IconSend /><span>Send</span></button>
      </div>

      <section className="hub-section hub-rise" style={{ animationDelay: "120ms" }}>
        <div className="hub-section-head">
          <div><span className="hub-kicker">Live market</span><h2>Assets</h2></div>
          <span className="hub-live"><i></i> Binance</span>
        </div>
        <div className="hub-list-card">
          {COIN_ORDER.map(function (coin) {
            var meta = COIN_META[coin];
            var asset = (card.assets || []).find(function (row) { return row.id === coin; });
            var live = pulse[coin];
            var amount = asset ? Number(asset.amount) || 0 : 0;
            var value = asset ? Number(asset.valueUsd) || 0 : 0;
            return (
              <button type="button" className="hub-asset-row" key={coin} onClick={function () { openCoin(coin); }}>
                <span className="hub-avatar"><AssetLogo code={coin} label={coin} /></span>
                <span className="hub-row-main">
                  <span className="hub-row-title">{meta.name}<small>{coin}</small></span>
                  <span className="hub-row-sub">{amount > 0 ? fmtQty(amount) + " " + coin + " \u00B7 " + fmtUsd(value) : "No open position"}</span>
                </span>
                <span className="hub-row-right">
                  <span className="hub-row-value">{live && live.price > 0 ? fmtPrice(live.price) : ready ? "\u2014" : "\u00B7\u00B7\u00B7"}</span>
                  {live ? <span className={"hub-row-side " + toneOf(live.change)}>{signedPct(live.change)}</span> : <span className="hub-row-side">24h</span>}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {heldAssets.length > 0 && (
        <section className="hub-allocation hub-rise" style={{ animationDelay: "160ms" }}>
          <div className="hub-section-head"><div><span className="hub-kicker">Diversification</span><h2>Allocation</h2></div><span>{heldAssets.length + " held"}</span></div>
          <div className="hub-allocation-list">
            {heldAssets.map(function (asset) {
              var meta = COIN_META[asset.id] || { name: asset.id, color: "#f4f2ec" };
              var value = Number(asset.valueUsd) || 0;
              var share = total > 0 ? value / total * 100 : Number(asset.allocation) || 0;
              return (
                <div className="hub-allocation-row" key={asset.id}>
                  <span>{meta.name}</span><b>{share.toFixed(1)}%</b>
                  <div><i style={{ width: Math.min(100, Math.max(0, share)) + "%", background: meta.color }}></i></div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="hub-section hub-rise" style={{ animationDelay: "200ms" }}>
        <div className="hub-section-head">
          <div><span className="hub-kicker">Transactions</span><h2>Recent activity</h2></div>
          <button type="button" className="hub-more" onClick={function () { navigate("/history"); }}>View all <IconChevron /></button>
        </div>
        <div className="hub-list-card">
          {entries.length > 0 ? entries.map(function (entry) {
            var coin = activityCoin(entry);
            var meta = COIN_META[coin] || { glyph: "\u2022", color: "#f4f2ec" };
            var top = entry.operationType === "sell" ? "+" + fmtUsd(entry.toAmount) : fmtQty(entry.toAmount) + " " + entry.toAsset;
            var bottom = entry.operationType === "buy" ? fmtUsd(entry.fromAmount) : fmtQty(entry.fromAmount) + " " + entry.fromAsset;
            return (
              <div className="hub-asset-row is-static" key={entry.id}>
                <span className="hub-avatar"><AssetLogo code={coin} label={coin} /></span>
                <span className="hub-row-main"><span className="hub-row-title">{activityTitle(entry)}</span><span className="hub-row-sub">{fmtWhen(entry.createdAt)}</span></span>
                <span className="hub-row-right"><span className="hub-row-value">{top}</span><span className="hub-row-side">{bottom}</span></span>
              </div>
            );
          }) : (
            <div className="hub-empty"><b>No activity yet</b><span>Your crypto trades will appear here.</span></div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Crypto;
