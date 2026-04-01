import React, { useState, useRef} from "react";
import { useNavigate, useLocation } from "react-router-dom";


const Order = () => {
 const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };

 const location = useLocation();

  // Принимаем данные маршрутизации (с фоллбэками)
  const { 
    type = 'Short', 
    coin = 'BTC', 
    currentPrice = 69035, 
    change = '+2.33%' 
  } = location.state || {};

  // Баланс пользователя
  const [balance, setBalance] = useState(78.50);
  
  // Ввод суммы (строка, чтобы инпут работал корректно)
  const [amountInput, setAmountInput] = useState("10");
  const leverage = 3;

  // Математика
  const parsedAmount = parseFloat(amountInput) || 0;
  const cryptoAmount = currentPrice > 0 ? (parsedAmount / currentPrice).toFixed(5) : 0;
  const requiredMargin = parsedAmount / leverage;
  const fees = parsedAmount * 0.001; // Комиссия 0.1% для реализма
  const totalRequired = requiredMargin + fees;
  
  const isBalanceLow = balance < totalRequired;
  const isTypeShort = type === 'Short';

  // Расчет цены ликвидации (упрощенный)
  let liqPrice = 0;
  if (parsedAmount > 0) {
    if (isTypeShort) {
      liqPrice = currentPrice * (1 + 1 / leverage);
    } else {
      liqPrice = currentPrice * (1 - 1 / leverage);
    }
  }

  const formatUsd = (num) => parseFloat(num).toFixed(2);
  const formatPrice = (num) => Math.round(num).toLocaleString('en-US');

  return (<div className="OrderContent">
<div className="Road-Home" onClick={roadHome}></div>
 
<div className="premium-exchange-wrapper">
      {/* Хедер */}
      <header className="px-header">
        <div className="px-coin-info">
          <h1 className="px-title">{type + " " + coin}</h1>
          <div className="px-price-row">
            <span className="px-current-price">{"$" + formatPrice(currentPrice)}</span>
            <span className={"px-change " + (change.includes('-') ? "color-down" : "color-up")}>
              {change}
            </span>
          </div>
        </div>
        <button className="px-market-btn">
          Market <span className="caret">▾</span>
        </button>
      </header>

      <main className="px-main-content">
        {/* Интерактивный блок ввода суммы */}
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
          <div className="px-crypto-conversion">
            {cryptoAmount + " " + coin}
          </div>
        </section>

        {/* Элегантная плашка ошибки (Top) */}
        {isBalanceLow && (
          <div className="px-alert-inline">
            <div className="px-alert-dot"></div>
            <span>Not enough funds. Deposit or change method.</span>
          </div>
        )}

        {/* Геймифицированные пресеты */}
        <section className="px-presets-container">
          {[10, 50, 100, 500].map((val) => {
            const isActive = parsedAmount === val;
            return (
              <button 
                key={val}
                className={"px-preset-btn " + (isActive ? "active" : "")}
                onClick={() => setAmountInput(val.toString())}
              >
                {"$" + val}
              </button>
            );
          })}
        </section>

        {/* Детали ордера */}
        <section className="px-details-card glass-card">
          <div className="px-row">
            <span className="px-label">Leverage</span>
<span className="px-val accent-val">{leverage + "x"}</span>
          </div>
          <div className="px-row">
            <span className="px-label">Auto close</span>
            <span className="px-val">TP Off, SL Off</span>
          </div>
          <div className="px-row">
            <span className="px-label">Pay with</span>
            <span className="px-val flex-val">
               Total Balance
            </span>
          </div>
        </section>

        {/* Ошибка 2 (Middle) */}
        {isBalanceLow && (
          <div className="px-alert-card glass-card-error">
            Insufficient funds to cover the trade
          </div>
        )}

        {/* Метрики */}
        <section className="px-metrics-card">
          <div className="px-row">
            <span className="px-label">Margin</span>
            <span className="px-val">{"$" + formatUsd(requiredMargin)}</span>
          </div>
          <div className="px-row">
            <span className="px-label">Liquidation price</span>
            <span className="px-val">{"$" + formatPrice(liqPrice)}</span>
          </div>
          <div className="px-row">
            <span className="px-label">Fees</span>
            <span className="px-val">{parsedAmount > 0 ? "$" + formatUsd(fees) : "-"}</span>
          </div>
        </section>
      </main>

      <footer className="px-footer">
  {/* Условие для отображения ошибки под кнопкой */}
  {isBalanceLow && (
    <div className="px-alert-bottom">
      {"Req: $" + formatUsd(totalRequired) + " / Avail: $" + formatUsd(balance)}
    </div>
  )}
  
  <button 
    /* Динамически меняем класс: btn-short для красного, btn-long для зеленого */
    className={"px-action-btn " + (isBalanceLow ? "btn-locked" : (type === 'short' ? "btn-short" : "btn-long"))}
    disabled={isBalanceLow}
    onClick={() => navigate('/trade')}
  >
    {isBalanceLow ? "Insufficient Funds" : "Open " + type}
  </button>
</footer>
    </div>

</div>);
};

export default Order;