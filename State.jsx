import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";


const State = () => {
 const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };

   const data = {
    totalProfit: 79.21,
    todayProfit: 12.98,
    referralBonus: 2.30,
    serialId: 'PRFT-99X'
  };

  // Форматирование чисел
  const formatVal = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2 });


    const balanceData = [40, 55, 45, 70, 40, 85, 60, 75, 55, 100, 65, 80];
  const incomeBars = [30, 60, 45, 90, 55, 75];
  const progressValues = [100, 65];

  // Генератор пути SVG через обычную конкатенацию (без обратных кавычек)
  const generatePath = (data, isArea) => {
    const width = 300;
    const height = 100;
    const step = width / (data.length - 1);
    
    let path = 'M 0 ' + (height - data[0]);
    for (let i = 1; i < data.length; i++) {
      path += ' L ' + (i * step) + ' ' + (height - data[i]);
    }
    
    if (isArea) {
      path += ' L ' + width + ' ' + height + ' L 0 ' + height + ' Z';
    }
    return path;
  };


  return (<div className="StateContent">

      <div className="profit-panel-wrapper">
      <div className="profit-panel">
        
        {/* <div className="pp-grid-bg"></div> */}

        {/* Верхняя панель (Шапка) */}
        <div className="pp-header">
          <div className="pp-badge">LIVE STATUS</div>
          <div className="pp-serial">{data.serialId}</div>
        </div>

        {/* Главный блок: Total Profit */}
        <div className="pp-main-metric">
          <div className="pp-label">TODAY'S PROFIT</div>
          <div className="pp-total-value">
            <span className="pp-currency">$</span>
            <span className="pp-digits">{formatVal(data.todayProfit)}</span>
          </div>
        </div>

        {/* Разделитель с декоративными элементами */}
        <div className="pp-divider">
          {/* <div className="pp-dot"></div> */}
          <div className="pp-line"></div>
          {/* <div className="pp-dot"></div> */}
        </div>

        {/* Нижний блок: Today's Profit и Referral Bonus */}
        <div className="pp-sub-metrics">
          <div className="pp-stat-box">
            <div className="pp-label">total PROFIT</div>
            <div className="pp-stat-val highlight-up">
              +{formatVal(data.totalProfit)} <span className="pp-currency">USD</span>
            </div>
          </div>
          
          <div className="pp-stat-box">
            <div className="pp-label">REFERRAL BONUS</div>
            <div className="pp-stat-val">
              +{formatVal(data.referralBonus)} <span className="pp-currency">USD</span>
            </div>
          </div>
        </div>

      </div>
    </div>
      



<div className="analytics-root">


      {/* Основная карточка */}
      <div className="card-plate bg-main">
        
        <div className="data-group">
          <span className="data-label">Total Profit</span>
          <div className="val-row">
            <span className="val-big">$6,324</span>
            <span className="trend-up">▲ $4,560.50</span>
          </div>
        </div>
        

        <div className="svg-container">
        {/* <div className="pp-grid-bg"></div> */}

          <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="graph-svg">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#004643" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#004643" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={generatePath(balanceData, true)} fill="url(#areaFill)" />
            <path d={generatePath(balanceData, false)} fill="none" stroke="#004643" strokeWidth="3" strokeLinejoin="round" />
            {/* <circle cx="250" cy="20" r="4" fill="#fff" className="glow-dot" /> */}
          </svg>
        </div>
        
        
      </div>

      {/* Нижний ряд */}
      <div className="grid-half">
        <div className="card-plate">
          <span className="data-label">Income</span>
          <div className="val-row stack">
            <span className="val-mid">$8,567</span>
            <span className="trend-down">▼ $4,560.50</span>
          </div>
          <div className="bars-box">
            {incomeBars.map((h, i) => (
              <div key={i} className="bar-unit" style={{ height: h + '%' }}></div>
            ))}
          </div>
        </div>

        <div className="card-plate">
          <span className="data-label">Income</span>
          <div className="val-row stack">
            <span className="val-mid">$8,567</span>
            <span className="trend-plus">⊕ Positive</span>
          </div>
          <div className="prog-stack">
            <div className="track"><div className="fill lime" style={{ width: progressValues[0] + '%' }}></div></div>
            <div className="track"><div className="fill pink" style={{ width: progressValues[1] + '%' }}></div></div>
          </div>
        </div>
      </div>
    </div>


 <div className="ms-container">
      
      <div className="ms-mini-card">
        <div className="ms-label">capitalization</div>
        <div className="ms-value">2,42 trill $</div>
        <div className={'ms-change ' + 'neg'}>-2,03 %</div>
      </div>

      <div className="ms-mini-card">
        <div className="ms-label">volume</div>
        <div className="ms-value">101,78 bill $</div>
        <div className={'ms-change ' + 'pos'}>+15,53 %</div>
      </div>

      <div className="ms-mini-card">
        <div className="ms-label">dominance</div>
        <div className="ms-value">56,30 %</div>
        <div className="ms-subtext">Bitcoin</div>
      </div>

    </div>


</div>);
};

export default State;