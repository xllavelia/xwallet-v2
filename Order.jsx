import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWalletBalance } from './useWallet';
import { useCardFunding } from './useCardFunding';
import { openPosition, openTimeTrade } from './usePositions';

function ChevronDown() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>);
}

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
  var displayBalance = activeCard ? activeCard.balance : wallet.balance;

  const [mode, setMode] = useState("standard"); // "standard" | "time"
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const [amountInput, setAmountInput] = useState(prefillAmount);
  const [leverage, setLeverage] = useState(prefillLeverage);
  const [submitted, setSubmitted] = useState(false);
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(false);
  const [autoCloseTarget, setAutoCloseTarget] = useState(5);
  const [errorMsg, setErrorMsg] = useState(null);
  const [voucherMsg, setVoucherMsg] = useState(null);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);

  var parsedAmount = parseFloat(amountInput) || 0;
  var cryptoAmount = currentPrice > 0 ? (parsedAmount / currentPrice).toFixed(6) : 0;
  var requiredMargin = mode === "time" ? parsedAmount : parsedAmount / leverage;
  var fees = mode === "time" ? 0 : parsedAmount * 0.005;
  var totalRequired = requiredMargin + fees;
  var isBalanceLow = displayBalance < totalRequired;

  var liqPrice = 0;
  if (mode === "standard" && parsedAmount > 0 && currentPrice > 0) {
    if (type === 'short') {
      liqPrice = currentPrice * (1 + 1 / leverage);
    } else {
      liqPrice = currentPrice * (1 - 1 / leverage);
    }
  }

  var durationSeconds = hours * 3600 + minutes * 60 + seconds;
  var minSeconds = 5 * 60;
  var maxSeconds = 72 * 3600;
  var durationValid = durationSeconds >= minSeconds && durationSeconds <= maxSeconds;

  function payoutMultiplierFor(sec) {
    var m = sec / 60;
    if (m < 30) return 1.80;
    if (m < 120) return 1.85;
    if (m < 720) return 1.90;
    return 1.95;
  }
  var payoutMultiplier = payoutMultiplierFor(durationSeconds);
  var potentialPayout = parsedAmount * payoutMultiplier;

  var dir = type === 'short' ? -1 : 1;
  var pnlAt2  = parsedAmount > 0 ? requiredMargin * leverage * 0.02 * dir : 0;
  var pnlAt5  = parsedAmount > 0 ? requiredMargin * leverage * 0.05 * dir : 0;
  var pnlAt10 = parsedAmount > 0 ? requiredMargin * leverage * 0.10 * dir : 0;

  var leverageOptions = [2, 5, 10, 25, 50, 100, 200];

  var formatUsd   = function(n) { return parseFloat(n).toFixed(2); };
  var formatPrice = function(n) { return Math.round(n).toLocaleString('en-US'); };

  var titleText = type.charAt(0).toUpperCase() + type.slice(1) + ' ' + coin;
  var changeClass = 'px-change ' + (change.toString().includes('-') ? 'color-down' : 'color-up');
  var balanceStr = '$' + displayBalance.toFixed(2);
  var afterTradeStr = '$' + (displayBalance - totalRequired).toFixed(2);
  var canSubmit = mode === "standard" ? !isBalanceLow : (!isBalanceLow && durationValid);
  var btnClass = 'px-action-btn ' + (!canSubmit ? 'btn-locked' : (type === 'short' ? 'btn-short' : 'btn-long'));
  var btnText = isBalanceLow ? 'Insufficient Funds' : (mode === "time" && !durationValid ? 'Set a valid duration' : ('Open ' + type.charAt(0).toUpperCase() + type.slice(1)));

  function roadHome() { navigate(-1); }

  function clampTimeField(setter, val, max) {
    var n = parseInt(val, 10);
    if (isNaN(n)) n = 0;
    if (n < 0) n = 0;
    if (n > max) n = max;
    setter(n);
  }

  async function handleOpenPosition() {
    if (!canSubmit || parsedAmount <= 0 || submitted) return;
    setErrorMsg(null);

    if (mode === "time") {
      try {
        await openTimeTrade({
          coin: coin, type: type, entryPrice: currentPrice,
          amount: parsedAmount, durationSeconds: durationSeconds
        });
        setSubmitted(true);
        setTimeout(function() { navigate(-1, { state: { coin: coin } }); }, 1200);
      } catch (err) {
        setErrorMsg(err.message);
      }
      return;
    }

    try {
      var result = await openPosition({
        coin: coin, type: type, entryPrice: currentPrice, leverage: leverage,
        amount: parsedAmount, autoClose: autoCloseEnabled,
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
          <div className="tt-mode-wrap">
            <button className="px-market-btn" onClick={() => setModeMenuOpen(!modeMenuOpen)}>
              {mode === "standard" ? "Standard" : "Time"} <ChevronDown />
            </button>
            {modeMenuOpen && (
              <div className="tt-mode-menu">
                <div className="tt-mode-menu-item" onClick={() => { setMode("standard"); setModeMenuOpen(false); }}>Standard</div>
                <div className="tt-mode-menu-item" onClick={() => { setMode("time"); setModeMenuOpen(false); }}>Time</div>
              </div>
            )}
          </div>
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

          {mode === "standard" && (
            <>
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
                  <div className={'px-toggle ' + (autoCloseEnabled ? 'on' : 'off')} onClick={() => setAutoCloseEnabled(!autoCloseEnabled)}>
                    <div className="px-toggle-thumb"></div>
                  </div>
                </div>
                {autoCloseEnabled && (
                  <div className="px-autoclose-body">
                    <span className="px-ac-label">Close when profit reaches</span>
                    <div className="px-ac-options">
                      {[3, 5, 10, 20, 50].map(function(pct) {
                        return (
                          <button key={pct} className={'px-lev-btn ' + (autoCloseTarget === pct ? 'active' : '')} onClick={() => setAutoCloseTarget(pct)}>
                            {'+' + pct + '%'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              <section className="px-details-card glass-card">
                <div className="px-row"><span className="px-label">Leverage</span><span className="px-val accent-val">{leverage + 'x'}</span></div>
                <div className="px-row"><span className="px-label">Pay with</span><span className="px-val flex-val">{activeCard ? (activeCard.tier.charAt(0).toUpperCase() + activeCard.tier.slice(1) + " Card") : "Wallet"}</span></div>
              </section>

              <section className="px-metrics-card">
                <div className="px-row"><span className="px-label">Margin</span><span className="px-val">{'$' + formatUsd(requiredMargin)}</span></div>
                <div className="px-row"><span className="px-label">Liquidation price</span><span className="px-val px-liq-price">{'$' + formatPrice(liqPrice)}</span></div>
                <div className="px-row"><span className="px-label">Fees</span><span className="px-val">{parsedAmount > 0 ? '$' + formatUsd(fees) : '-'}</span></div>
                <div className="px-row"><span className="px-label">Balance Now</span><span className="px-val px-after-trade">{balanceStr}</span></div>
                <div className="px-row"><span className="px-label">Balance after</span><span className="px-val px-after-trade">{parsedAmount > 0 ? afterTradeStr : balanceStr}</span></div>
              </section>
            </>
          )}

          {mode === "time" && (
            <>
              <section className="tt-duration-card">
                <span className="tt-duration-label">Duration</span>
                <div className="tt-duration-inputs">
                  <div className="tt-duration-field">
                    <input type="number" value={hours} onChange={(e) => clampTimeField(setHours, e.target.value, 72)} />
                    <span>h</span>
                  </div>
                  <div className="tt-duration-field">
                    <input type="number" value={minutes} onChange={(e) => clampTimeField(setMinutes, e.target.value, 59)} />
                    <span>m</span>
                  </div>
                  <div className="tt-duration-field">
                    <input type="number" value={seconds} onChange={(e) => clampTimeField(setSeconds, e.target.value, 59)} />
                    <span>s</span>
                  </div>
                </div>
              </section>
              {!durationValid && (
                <div className="px-alert-inline"><div className="px-alert-dot"></div><span>Duration must be between 5 minutes and 72 hours</span></div>
              )}

              <section className="px-details-card glass-card">
                <div className="px-row"><span className="px-label">Pay with</span><span className="px-val flex-val">{activeCard ? (activeCard.tier.charAt(0).toUpperCase() + activeCard.tier.slice(1) + " Card") : "Wallet"}</span></div>
              </section>

              <section className="px-metrics-card">
                <div className="px-row"><span className="px-label">Stake</span><span className="px-val">{'$' + formatUsd(requiredMargin)}</span></div>
                <div className="px-row"><span className="px-label">Payout multiplier</span><span className="px-val accent-val">{payoutMultiplier.toFixed(2) + 'x'}</span></div>
                <div className="px-row"><span className="px-label">Potential payout</span><span className="px-val px-liq-price" style={{color:'#00d4aa'}}>{'$' + formatUsd(potentialPayout)}</span></div>
                <div className="px-row"><span className="px-label">Balance Now</span><span className="px-val px-after-trade">{balanceStr}</span></div>
                <div className="px-row"><span className="px-label">Balance after</span><span className="px-val px-after-trade">{parsedAmount > 0 ? afterTradeStr : balanceStr}</span></div>
              </section>
            </>
          )}

        </main>

        <footer className="px-footer">
          {isBalanceLow && <div className="px-alert-bottom">{'Req: $' + formatUsd(totalRequired) + ' / Avail: $' + formatUsd(displayBalance)}</div>}
          {submitted && <div className="px-success-bar">{mode === "time" ? "Time trade placed! Returning to chart..." : "Position opened! Returning to chart..."}</div>}
          {voucherMsg && <div className="px-success-bar" style={{color: 'var(--xlavelia)'}}>{voucherMsg}</div>}
          <button className={btnClass} disabled={!canSubmit || submitted} onClick={handleOpenPosition}>
            {btnText}
          </button>
        </footer>

      </div>
    </div>
  );
};

export default Order;