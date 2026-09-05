import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWalletBalance } from './useWallet';
import { openPosition } from './usePositions';
import { useCardFunding } from "./useCardFunding";

const Order = () => {
  const navigate = useNavigate();
  const location = useLocation();

  var stateData = location.state || {};
  var type = stateData.type || 'short';
  var coin = stateData.coin || 'BTC';
  var rawPrice = stateData.price || '69035';
  var change = stateData.change || '+2.33%';
  var prefillLeverage = stateData.leverage || 3;
  var prefillAmount = stateData.amount ? stateData.amount.toString() : "10";

  var currentPrice = parseFloat(rawPrice.toString().replace(/,/g, '')) || 69035;
var { wallet } = useWalletBalance();
var { activeCard } = useCardFunding();
var balance = activeCard ? activeCard.balance : wallet.balance;
  var liveFeeRate = wallet.feeRatePercent || 1.0;
  // var balance = wallet.balance;

  const [amountInput, setAmountInput] = useState(prefillAmount);
  const [leverage, setLeverage] = useState(prefillLeverage);
  const [submitted, setSubmitted] = useState(false);
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(false);
  const [autoCloseTarget, setAutoCloseTarget] = useState(5);
  const [errorMsg, setErrorMsg] = useState(null);
const [voucherMsg, setVoucherMsg] = useState(null);
  var parsedAmount = parseFloat(amountInput) || 0;
  var cryptoAmount = currentPrice > 0 ? (parsedAmount / currentPrice).toFixed(6) : 0;
var requiredMargin = parsedAmount / leverage;
var fees = requiredMargin * (liveFeeRate / 100);
var totalRequired = requiredMargin + fees;
  var isBalanceLow = balance < totalRequired;

  var liqPrice = 0;
  if (parsedAmount > 0 && currentPrice > 0) {
    if (type === 'short') {
      liqPrice = currentPrice * (1 + 1 / leverage);
    } else {
      liqPrice = currentPrice * (1 - 1 / leverage);
    }
  }

  var dir = type === 'short' ? -1 : 1;
  var pnlAt2  = parsedAmount > 0 ? requiredMargin * leverage * 0.02 * dir : 0;
  var pnlAt5  = parsedAmount > 0 ? requiredMargin * leverage * 0.05 * dir : 0;
  var pnlAt10 = parsedAmount > 0 ? requiredMargin * leverage * 0.10 * dir : 0;
  var s2  = pnlAt2  >= 0 ? '+' : '';
  var s5  = pnlAt5  >= 0 ? '+' : '';
  var s10 = pnlAt10 >= 0 ? '+' : '';
  var pnl2Str  = s2  + '$' + pnlAt2.toFixed(2);
  var pnl5Str  = s5  + '$' + pnlAt5.toFixed(2);
  var pnl10Str = s10 + '$' + pnlAt10.toFixed(2);
  var pnl2Class  = 'px-pnl-cell ' + (pnlAt2  >= 0 ? 'pos' : 'neg');
  var pnl5Class  = 'px-pnl-cell ' + (pnlAt5  >= 0 ? 'pos' : 'neg');
  var pnl10Class = 'px-pnl-cell ' + (pnlAt10 >= 0 ? 'pos' : 'neg');

  var leverageOptions = [2, 5, 10, 25, 50, 100, 200];

  var formatUsd   = function(n) { return parseFloat(n).toFixed(2); };
  var formatPrice = function(n) { return Math.round(n).toLocaleString('en-US'); };

  var titleText = type.charAt(0).toUpperCase() + type.slice(1) + ' ' + coin;
  var changeClass = 'px-change ' + (change.toString().includes('-') ? 'color-down' : 'color-up');
  var balanceStr = '$' + balance.toFixed(2);
  var afterTradeStr = '$' + (balance - totalRequired).toFixed(2);
  var btnClass = 'px-action-btn ' + (isBalanceLow ? 'btn-locked' : (type === 'short' ? 'btn-short' : 'btn-long'));
  var btnText = isBalanceLow ? 'Insufficient Funds' : ('Open ' + type.charAt(0).toUpperCase() + type.slice(1));

  var feesDisplayStr = parsedAmount > 0 ? '$' + formatUsd(fees) : '-';

  function roadHome() { navigate(-1); }

  async function handleOpenPosition() {
    if (isBalanceLow || parsedAmount <= 0 || submitted) return;
    setErrorMsg(null);

  try {
  var result = await openPosition({
    coin: coin,
    type: type,
    entryPrice: currentPrice,
    leverage: leverage,
    amount: parsedAmount,
    autoClose: autoCloseEnabled,
    autoCloseTarget: autoCloseEnabled ? autoCloseTarget : null
  });
  setSubmitted(true);
  if (result.feesFromVoucher > 0) {
    setVoucherMsg(result.feesPaidByVoucher
      ? "Fee fully covered by your voucher!"
      : ('$' + result.feesFromVoucher.toFixed(2) + ' of your fee was covered by a voucher'));
  }
  setTimeout(function() { navigate(-1, { state: { coin: coin } }); }, 1200);
} catch (err) {
  setErrorMsg(err.message);
}
  }

  return (
    <div className="OrderContent">
      <div className="Road-Home" onClick={roadHome}></div>

      <div className="premium-exchange-wrapper">

        <header className="px-header">
          <div className="px-coin-info">
            <h1 className="px-title">{titleText}</h1>
            <div className="px-price-row">
              <span className="px-current-price">{'$' + formatPrice(currentPrice)}</span>
              <span className={changeClass}>{change}</span>
            </div>
          </div>
          <button className="px-market-btn">Market <span className="caret">▾</span></button>
        </header>

        <main className="px-main-content">

          <section className="px-hero-input">
            <div className="px-input-container">
              <input
                type="number"
                className="px-giant-input"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="px-crypto-conversion">{cryptoAmount + ' ' + coin}</div>
          </section>

          {isBalanceLow && (
            <div className="px-alert-inline">
              <div className="px-alert-dot"></div>
              <span>Not enough funds. Deposit or change method.</span>
            </div>
          )}

          {errorMsg && (
            <div className="px-alert-inline">
              <div className="px-alert-dot"></div>
              <span>{errorMsg}</span>
            </div>
          )}

          <section className="px-presets-container">
            {[10, 50, 100, 500].map(function(val) {
              var isActive = parsedAmount === val;
              return (
                <button key={val} className={'px-preset-btn ' + (isActive ? 'active' : '')} onClick={() => setAmountInput(val.toString())}>
                  {'$' + val}
                </button>
              );
            })}
          </section>

          <section className="px-leverage-section">
            <span className="px-leverage-title">Leverage</span>
            <div className="px-leverage-options">
              {leverageOptions.map(function(lv) {
                return (
                  <button key={lv} className={'px-lev-btn ' + (leverage === lv ? 'active' : '')} onClick={() => setLeverage(lv)}>
                    {lv + 'x'}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-autoclose-section">
            <div className="px-autoclose-header">
              <span className="px-leverage-title">Auto Close (Take Profit)</span>
              <div
                className={'px-toggle ' + (autoCloseEnabled ? 'on' : 'off')}
                onClick={() => setAutoCloseEnabled(!autoCloseEnabled)}
              >
                <div className="px-toggle-thumb"></div>
              </div>
            </div>
            {autoCloseEnabled && (
              <div className="px-autoclose-body">
                <span className="px-ac-label">Close when profit reaches</span>
                <div className="px-ac-options">
                  {[3, 5, 10, 20, 50].map(function(pct) {
                    return (
                      <button
                        key={pct}
                        className={'px-lev-btn ' + (autoCloseTarget === pct ? 'active' : '')}
                        onClick={() => setAutoCloseTarget(pct)}
                      >
                        {'+' + pct + '%'}
                      </button>
                    );
                  })}
                </div>
                <div className="px-ac-preview">
                  {'TP at $' + formatUsd(requiredMargin * leverage * (autoCloseTarget / 100)) + ' profit'}
                </div>
              </div>
            )}
          </section>

          <section className="px-details-card glass-card">
            <div className="px-row">
              <span className="px-label">Leverage</span>
              <span className="px-val accent-val">{leverage + 'x'}</span>
            </div>
            <div className="px-row">
              <span className="px-label">Auto close</span>
              <span className="px-val">TP Off, SL Off</span>
            </div>
            <div className="px-row">
              <span className="px-label">Pay with</span>
              <span className="px-val flex-val">Total Balance</span>
            </div>
          </section>

          <section className="px-metrics-card">
            <div className="px-row">
              <span className="px-label">Margin</span>
              <span className="px-val">{'$' + formatUsd(requiredMargin)}</span>
            </div>
            <div className="px-row">
              <span className="px-label">Liquidation price</span>
              <span className="px-val px-liq-price">{'$' + formatPrice(liqPrice)}</span>
            </div>
            <div className="px-row">
              <span className="px-label">Fees</span>
          <span className="px-label">{'Fees (' + liveFeeRate + '%)'}</span>
            </div>
            <div className="px-row">
              <span className="px-label">Balance Now</span>
              <span className="px-val px-after-trade">{balanceStr}</span>
            </div>
            <div className="px-row">
              <span className="px-label">Balance after</span>
              <span className="px-val px-after-trade">{parsedAmount > 0 ? afterTradeStr : balanceStr}</span>
            </div>
          </section>

        </main>

        <footer className="px-footer">
          {isBalanceLow && (
            <div className="px-alert-bottom">{'Req: $' + formatUsd(totalRequired) + ' / Avail: $' + formatUsd(balance)}</div>
          )}
          {submitted && (
            <div className="px-success-bar">Position opened! Returning to chart...</div>
          )}
          {voucherMsg && (
  <div className="px-success-bar" style={{color: 'var(--xlavelia)'}}>{voucherMsg}</div>
)}
          <button className={btnClass} disabled={isBalanceLow || submitted} onClick={handleOpenPosition}>
            {btnText}
          </button>
        </footer>

      </div>
    </div>
  );
};

export default Order;