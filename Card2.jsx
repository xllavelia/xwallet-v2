import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Card2 = () => {

const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };


  // Данные наших карт
  const cardsData = [
    {
      assets: [
        { name: 'Bitcoin', ticker: 'BTC', amount: 0.00, fiat: 0.00, icon: '' },
        { name: 'Ethereum', ticker: 'ETH', amount: 0.00, fiat: 0.00, icon: '' },
        { name: 'Solana', ticker: 'SOL', amount: 0.00, fiat: 0.00, icon: '' }
      ],
      stats: [
        { label: 'Total Inflow', value: 0.00 },
        { label: 'Total Outflow', value: 0.00 },
        { label: 'Monthly Limit', value: 0.00 }
      ],

        stats2: [
{ label: 'Date', value: "12/26"},
{ label: 'Balance', value: "0.00 dollars"},
{ label: 'Brand', value: "VISA" },
{ label: 'Owner', value: "xlavelia laga" },
{ label: 'Card Number', value: "1234 9820 9827 1234"}
      ]
    }
  ];


  return (<div className="CardContent">

 <div className="card-details-wrapper">
      
     

      {/* Слайдер с картами и контентом */}
      <div className="cd-slider">
        
        {cardsData.map((card) => (
          <div key={card.id} className="cd-slide">
            
<div className="Card-center-">
        <div className={'mc-item mc-card- ' + 'bg-white'}>
          <div className="mc-top">
            <div>
              <div className="mc-label">Current Balance</div>
              <div className="mc-balance">$0.00</div>
            </div>
            <div className="mc-contactless">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 21.3c-2.8-2.6-4.5-6.4-4.5-10.6 0-4.2 1.7-8 4.5-10.6"></path>
                <path d="M12.5 18.5c-2-1.9-3.2-4.6-3.2-7.6 0-3 1.2-5.7 3.2-7.6"></path>
                <path d="M16 15.2c-1.1-1.1-1.8-2.6-1.8-4.3 0-1.7.7-3.2 1.8-4.3"></path>
                <path d="M19 12c0-.8-.3-1.6-.8-2.2"></path>
              </svg>
            </div>
          </div>

          <div className="mc-bottom">
            <div className="mc-info-row">
              <span>XLAVELIA LAGA</span>
              <span>12/26</span>
            </div>
            <div className="mc-number-row">
              <span>1234 **** **** 1234</span>
              <div className="mc-mastercard">
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#eb001b" fillOpacity="0.9"></circle>
                  <circle cx="22" cy="10" r="10" fill="#f79e1b" fillOpacity="0.9"></circle>
                </svg>
              </div>
            </div>
          </div>
        </div>
</div>
            
            

            {/* СПИСОК АКТИВОВ */}
            <div className="cd-section">
              <h3 className="cd-section-title">LINKED ASSETS</h3>
              <div className="assets-list">
                {card.assets.map((asset, idx) => (
                  <div key={idx} className="asset-item">
                    <div className={'asset-icon ' + card.theme + '-text'}>{asset.icon}
                    </div>
                    <div className="asset-info">
                      <span className="a-name">{asset.name}</span>
                      <span className="a-ticker">{asset.amount + ' ' + asset.ticker}</span>
                    </div>
                    <div className="asset-value">
                      {'$ ' + asset.fiat.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ЭЛИТНАЯ СТАТИСТИКА */}
            <div className="cd-section">
              <h3 className="cd-section-title">CARD INFO</h3>
              <div className="elite-stats-list">
                {card.stats.map((stat, idx) => (
                  <div key={idx} className="elite-stat-item">
                    <span className="es-label">{stat.label}</span>
                    <span className="es-dots"></span>
                    <span className="es-value">{'$ ' + stat.value.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                ))}

  {card.stats2.map((stat, idx) => (
                  <div key={idx} className="elite-stat-item">
                    <span className="es-label">{stat.label}</span>
                    <span className="es-dots"></span>
                    <span className="es-value">{stat.value}</span>
                  </div>
                ))}

              </div>
            </div>

          </div>
        ))}

      </div>
    </div>

  </div>);
};

export default Card2;