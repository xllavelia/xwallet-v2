import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBalance, writeBalance, writePosition } from './useBalance';

const Order = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = location.state || {};
  const type = stateData.type || 'short';
  const coin = stateData.coin || 'BTC';
  const rawPrice = stateData.price || '69035';
  const change = stateData.change || '+2.33%';

  const currentPrice = parseFloat(rawPrice.toString().replace(/,/g, '')) || 69035;

  const balance = useBalance();

  const [amountInput, setAmountInput] = useState("10");
  const [leverage, setLeverage] = useState(3);
  const [submitted, setSubmitted] = useState(false);

  const parsedAmount = parseFloat(amountInput) || 0;
  const cryptoAmount = currentPrice > 0 ? (parsedAmount / currentPrice).toFixed(6) : 0;
  const requiredMargin = parsedAmount / leverage;
  const fees = parsedAmount * 0.001;
  const totalRequired = requiredMargin + fees;
  const isBalanceLow = balance < totalRequired;
  const isTypeShort = type === 'short';

  var liqPrice = 0;
  if (parsedAmount > 0) {
    if (isTypeShort) {
      liqPrice = currentPrice * (1 + 1 / leverage);
    } else {
      liqPrice = currentPrice * (1 - 1 / leverage);
    }
  }

  var pnlAt10 = 0;
  var pnlAt5 = 0;
  var pnlAt2 = 0;
  if (parsedAmount > 0 && currentPrice > 0) {
    var dir = isTypeShort ? -1 : 1;
    pnlAt2 = requiredMargin * leverage * 0.02 * dir;
    pnlAt5 = requiredMargin * leverage * 0.05 * dir;
    pnlAt10 = requiredMargin * leverage * 0.10 * dir;
  }

  var pnlSign2 = pnlAt2 >= 0 ? '+' : '';
  var pnlSign5 = pnlAt5 >= 0 ? '+' : '';
  var pnlSign10 = pnlAt10 >= 0 ? '+' : '';
  var pnl2Str = pnlSign2 + '$' + pnlAt2.toFixed(2);
  var pnl5Str = pnlSign5 + '$' + pnlAt5.toFixed(2);
  var pnl10Str = pnlSign10 + '$' + pnlAt10.toFixed(2);
  var pnl2Class = pnlAt2 >= 0 ? 'px-pnl-cell pos' : 'px-pnl-cell neg';
  var pnl5Class = pnlAt5 >= 0 ? 'px-pnl-cell pos' : 'px-pnl-cell neg';
  var pnl10Class = pnlAt10 >= 0 ? 'px-pnl-cell pos' : 'px-pnl-cell neg';

  var leverageOptions = [2, 3, 5, 10, 20];

  var formatUsd = function (num) { return parseFloat(num).toFixed(2); };
  var formatPrice = function (num) { return Math.round(num).toLocaleString('en-US'); };

  var btnClass = 'px-action-btn ' + (isBalanceLow ? 'btn-locked' : (type === 'short' ? 'btn-short' : 'btn-long'));
  var btnText = isBalanceLow ? 'Insufficient Funds' : ('Open ' + type.charAt(0).toUpperCase() + type.slice(1));
  var balanceStr = '$' + balance.toFixed(2);
  var afterTradeStr = '$' + (balance - totalRequired).toFixed(2);
  var changeClass = 'px-change ' + (change.includes('-') ? 'color-down' : 'color-up');
  var titleText = type.charAt(0).toUpperCase() + type.slice(1) + ' ' + coin;

  function roadHome() { navigate("/"); }

  function handleOpenPosition() {
    if (isBalanceLow || parsedAmount <= 0) return;
    var newBalance = parseFloat((balance - totalRequired).toFixed(2));
    writeBalance(newBalance);
    writePosition({
      coin: coin,
      type: type,
      entryPrice: currentPrice,
      amount: parsedAmount,
      leverage: leverage,
      margin: requiredMargin,
      liqPrice: liqPrice,
      fees: fees,
      openTime: Date.now()
    });
    setSubmitted(true);
    setTimeout(function () { navigate('/trade', { state: { coin: coin } }); }, 1200);
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
              <span className="px-currency">$</span>
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

          <section className="px-presets-container">
            {[10, 50, 100, 500].map((val) => {
              const isActive = parsedAmount === val;
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
              {leverageOptions.map(function (lv) {
                return (
                  <button key={lv} className={'px-lev-btn ' + (leverage === lv ? 'active' : '')} onClick={() => setLeverage(lv)}>
                    {lv + 'x'}
                  </button>
                );
              })}
            </div>
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

          {isBalanceLow && (
            <div className="px-alert-card glass-card-error">Insufficient funds to cover the trade</div>
          )}

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
              <span className="px-val">{parsedAmount > 0 ? '$' + formatUsd(fees) : '-'}</span>
            </div>
            <div className="px-row">
              <span className="px-label">Balance after</span>
              <span className="px-val px-after-trade">{parsedAmount > 0 ? afterTradeStr : balanceStr}</span>
            </div>
          </section>

          {parsedAmount > 0 && (
            <section className="px-pnl-preview">
              <div className="px-pnl-title">Estimated P&L</div>
              <div className="px-pnl-table">
                <div className="px-pnl-row px-pnl-header">
                  <span>Move</span>
                  <span>P&L</span>
                </div>
                <div className="px-pnl-row">
                  <span className="px-pnl-label">2%</span>
                  <span className={pnl2Class}>{pnl2Str}</span>
                </div>
                <div className="px-pnl-row">
                  <span className="px-pnl-label">5%</span>
                  <span className={pnl5Class}>{pnl5Str}</span>
                </div>
                <div className="px-pnl-row">
                  <span className="px-pnl-label">10%</span>
                  <span className={pnl10Class}>{pnl10Str}</span>
                </div>
              </div>
            </section>
          )}

        </main>

        <footer className="px-footer">
          {isBalanceLow && (
            <div className="px-alert-bottom">{'Req: $' + formatUsd(totalRequired) + ' / Avail: $' + formatUsd(balance)}</div>
          )}
          {submitted && (
            <div className="px-success-bar">Position opened! Returning to chart...</div>
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