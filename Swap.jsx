import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletBalance } from "./useWallet";
import { useCard, executeSwap } from "./useCard";
import {
  fmtQty,
  IconBack,
  IconChevronDown,
  IconSwapVertical,
  IconCheck
} from "./marketsShared";
import { AssetLogo } from "./AssetLogos";

var ASSETS = [
  { id: "USDT", label: "Tether", color: "#26a17b", glyph: "$" },
  { id: "BTC", label: "Bitcoin", color: "#f7931a", glyph: "\u20BF" },
  { id: "ETH", label: "Ethereum", color: "#8c8fee", glyph: "\u039E" },
  { id: "SOL", label: "Solana", color: "#14f195", glyph: "\u25CE" },
  { id: "TON", label: "Toncoin", color: "#0098ea", glyph: "\u25C6" }
];

function assetMeta(id) { return ASSETS.find(function (a) { return a.id === id; }) || ASSETS[0]; }

function fmtRate(value) {
  var n = Number(value) || 0;
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return fmtQty(n);
}

const Swap = () => {
  const navigate = useNavigate();

  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var { card, refresh: refreshCard } = useCard();

  var [fromAsset, setFromAsset] = useState("USDT");
  var [toAsset, setToAsset] = useState("BTC");
  var [fromAmount, setFromAmount] = useState("");
  var [prices, setPrices] = useState({});
  var [pickerOpenFor, setPickerOpenFor] = useState(null);
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);

  useEffect(function () {
    var active = true;
    function fetchPrices() {
      var coins = ["BTC", "ETH", "SOL", "TON"];
      var symbols = JSON.stringify(coins.map(function (c) { return c + "USDT"; }));
      fetch("https://api.binance.com/api/v3/ticker/price?symbols=" + symbols)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!active) return;
          var next = { USDT: 1 };
          data.forEach(function (item) { next[item.symbol.replace("USDT", "")] = parseFloat(item.price); });
          setPrices(next);
        })
        .catch(function () {});
    }
    fetchPrices();
    var iv = setInterval(fetchPrices, 8000);
    return function () { active = false; clearInterval(iv); };
  }, []);

  function getAvailable(assetId) {
    if (assetId === "USDT") {
      return card.usdtBalance != null ? Number(card.usdtBalance) || 0 : Number(wallet.balance) || 0;
    }
    var match = card.assets ? card.assets.find(function (a) { return a.id === assetId; }) : null;
    return match ? Number(match.amount) || 0 : 0;
  }

  var fromAmountNum = parseFloat(fromAmount) || 0;
  var fromPrice = prices[fromAsset] || 0;
  var toPrice = prices[toAsset] || 0;
  var toAmountNum = toPrice > 0 ? (fromAmountNum * fromPrice) / toPrice : 0;
  var rate = toPrice > 0 && fromPrice > 0 ? fromPrice / toPrice : 0;
  // Для мелких курсов показываем обратную пару — «0.000012» читается плохо
  var rateText = rate > 0
    ? (rate < 0.001
      ? "1 " + toAsset + " \u2248 " + fmtRate(1 / rate) + " " + fromAsset
      : "1 " + fromAsset + " \u2248 " + fmtRate(rate) + " " + toAsset)
    : "\u2014";
  var availableFrom = getAvailable(fromAsset);
  var availableTo = getAvailable(toAsset);
  var insufficient = fromAmountNum > availableFrom;

  function handleFlip() {
    var oldFrom = fromAsset;
    setFromAsset(toAsset);
    setToAsset(oldFrom);
    setFromAmount("");
    setStatusMsg(null);
  }

  function handlePickAsset(side, assetId) {
    if (side === "from") {
      if (assetId === toAsset) setToAsset(fromAsset);
      setFromAsset(assetId);
    } else {
      if (assetId === fromAsset) setFromAsset(toAsset);
      setToAsset(assetId);
    }
    setStatusMsg(null);
    setPickerOpenFor(null);
  }

  function handleAmountChange(event) {
    var next = event.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
    var parts = next.split(".");
    if (parts.length > 2) next = parts[0] + "." + parts.slice(1).join("");
    setFromAmount(next);
  }

  async function handleSubmit() {
    if (fromAmountNum <= 0 || insufficient || isSubmitting) return;
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      var result = await executeSwap(fromAsset, toAsset, fromAmountNum);
      setStatusMsg("Swapped into " + fmtQty(result.toAmount) + " " + toAsset);
      setStatusOk(true);
      setFromAmount("");
      refreshWallet();
      refreshCard();
    } catch (err) {
      setStatusMsg(err.message);
      setStatusOk(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  var fromMeta = assetMeta(fromAsset);
  var toMeta = assetMeta(toAsset);

  return (
    <div className="swp-page">
      <header className="swp-header">
        <button type="button" className="swp-back" onClick={function () { navigate(-1); }} aria-label="Back">
          <IconBack />
          <span>Back</span>
        </button>
        <h1 className="swp-title">Swap</h1>
        <span className="swp-header-spacer" aria-hidden="true"></span>
      </header>

      <main className="swp-main">
        <section className="swp-ticket" aria-label="Swap assets">
          <div className="swp-field swp-field-pay">
            <div className="swp-field-head">
              <label className="swp-label" htmlFor="swp-pay-amount">You pay</label>
              <div className="swp-balance-line">
                <span>Available {fmtQty(availableFrom) + " " + fromAsset}</span>
                <button type="button" className="swp-max" onClick={function () { setFromAmount(String(availableFrom)); }}>
                  Max
                </button>
              </div>
            </div>

            <div className="swp-amount-row">
              <input
                id="swp-pay-amount"
                className="swp-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                spellCheck="false"
                placeholder="0"
                value={fromAmount}
                onChange={handleAmountChange}
                aria-label={"Amount in " + fromAsset}
              />
              <button
                type="button"
                className="swp-asset-selector"
                onClick={function () { setPickerOpenFor(pickerOpenFor === "from" ? null : "from"); }}
                aria-haspopup="dialog"
                aria-expanded={pickerOpenFor === "from"}
                aria-label={"Select asset to pay, currently " + fromAsset}
              >
                <span className="swp-asset-icon"><AssetLogo code={fromAsset} label={fromAsset} /></span>
                <span className="swp-asset-code">{fromAsset}</span>
                <IconChevronDown />
              </button>
            </div>
          </div>

          <div className="swp-divider">
            <span className="swp-divider-line" aria-hidden="true"></span>
            <button type="button" className="swp-flip" onClick={handleFlip} aria-label="Switch assets">
              <IconSwapVertical />
            </button>
            <span className="swp-divider-line" aria-hidden="true"></span>
          </div>

          <div className="swp-field swp-field-receive">
            <div className="swp-field-head">
              <span className="swp-label" id="swp-receive-label">You receive</span>
              <span className="swp-balance-line">Balance {fmtQty(availableTo) + " " + toAsset}</span>
            </div>

            <div className="swp-amount-row">
              <output
                className={"swp-amount swp-amount-output" + (toAmountNum > 0 ? "" : " is-zero")}
                aria-labelledby="swp-receive-label"
              >
                {toAmountNum > 0 ? fmtQty(toAmountNum) : "0"}
              </output>
              <button
                type="button"
                className="swp-asset-selector"
                onClick={function () { setPickerOpenFor(pickerOpenFor === "to" ? null : "to"); }}
                aria-haspopup="dialog"
                aria-expanded={pickerOpenFor === "to"}
                aria-label={"Select asset to receive, currently " + toAsset}
              >
                <span className="swp-asset-icon"><AssetLogo code={toAsset} label={toAsset} /></span>
                <span className="swp-asset-code">{toAsset}</span>
                <IconChevronDown />
              </button>
            </div>
          </div>
        </section>

        <div className="swp-presets" aria-label="Amount presets">
          {["25", "50", "75", "Max"].map(function (preset) {
            return (
              <button
                type="button"
                key={preset}
                className={"swp-preset" + (preset === "Max" ? " is-max" : "")}
                onClick={function () {
                  setFromAmount(preset === "Max" ? String(availableFrom) : String(availableFrom * Number(preset) / 100));
                }}
              >
                {preset === "Max" ? preset : preset + "%"}
              </button>
            );
          })}
        </div>

        <section className="swp-details" aria-labelledby="swp-details-title">
          <div className="swp-details-head">
            <h2 id="swp-details-title">Market details</h2>
            <span className="swp-live">Live</span>
          </div>
          <div className="swp-details-row">
            <span>Live rate</span>
            <strong>{rateText}</strong>
          </div>
          <div className="swp-details-row">
            <span>Network fee</span>
            <strong className="swp-fee">Free</strong>
          </div>
          <div className="swp-details-row">
            <span>Estimated receive</span>
            <strong>{toAmountNum > 0 ? fmtQty(toAmountNum) + " " + toAsset : "\u2014"}</strong>
          </div>
        </section>

        <div className="swp-feedback" aria-live="polite">
          {insufficient && fromAmountNum > 0 && (
            <div className="swp-error" role="alert">Insufficient {fromAsset} balance</div>
          )}
          {statusMsg && (
            <div className={"swp-status " + (statusOk ? "is-success" : "is-error")} role="status">
              {statusMsg}
            </div>
          )}
        </div>

        <button
          type="button"
          className="swp-cta"
          disabled={fromAmountNum <= 0 || insufficient || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Swapping..." : "Swap"}
        </button>
      </main>

      {pickerOpenFor && (
        <div
          className="swp-sheet-backdrop"
          onClick={function () { setPickerOpenFor(null); }}
          onKeyDown={function (event) { if (event.key === "Escape") setPickerOpenFor(null); }}
        >
          <section
            className="swp-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="swp-sheet-title"
            onClick={function (event) { event.stopPropagation(); }}
          >
            <span className="swp-sheet-handle" aria-hidden="true"></span>
            <div className="swp-sheet-head">
              <h2 id="swp-sheet-title">Choose asset</h2>
              <button
                type="button"
                className="swp-sheet-close"
                onClick={function () { setPickerOpenFor(null); }}
                aria-label="Close asset picker"
                autoFocus
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="swp-asset-list">
              {ASSETS.map(function (asset) {
                var active = pickerOpenFor === "from" ? asset.id === fromAsset : asset.id === toAsset;
                return (
                  <button
                    type="button"
                    key={asset.id}
                    className={"swp-asset-option" + (active ? " is-active" : "")}
                    onClick={function () { handlePickAsset(pickerOpenFor, asset.id); }}
                    aria-pressed={active}
                  >
                    <span className="swp-asset-icon"><AssetLogo code={asset.id} label={asset.label} /></span>
                    <span className="swp-asset-copy">
                      <span className="swp-asset-code">{asset.id}</span>
                      <span className="swp-asset-name">{asset.label}</span>
                    </span>
                    <span className="swp-asset-balance">
                      <span>Balance</span>
                      <strong>{fmtQty(getAvailable(asset.id)) + " " + asset.id}</strong>
                    </span>
                    {active && <span className="swp-asset-check" aria-hidden="true"><IconCheck /></span>}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Swap;
