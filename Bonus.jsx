import React, { useState, useEffect} from "react";
import { useVoucherUsed, VOUCHER_TOTAL } from './useBalance';
import { useNavigate } from "react-router-dom";


const Bonus = () => {
 const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };


var voucherUsed = useVoucherUsed();
var remaining = (VOUCHER_TOTAL - voucherUsed).toFixed(2);
var redeemed = voucherUsed;
var remainingActive = VOUCHER_TOTAL - voucherUsed;

  // const remaining = (ticket.total - ticket.used).toFixed(2);

const ticketId = '847291';
  const tradesCount = 14;

  // Логика таймера (4 дня)
  const [timeLeft, setTimeLeft] = useState(345600); // 4 дня в секундах

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const d = Math.floor(timeLeft / (3600 * 24));
    const h = Math.floor((timeLeft % (3600 * 24)) / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    // Сборка строки без шаблонов
    return d + 'd ' + h + 'h ' + m + 'm ' + s + 's';
  };


  return (<div className="BonusContent">
<div className="Road-Home" onClick={roadHome}></div>

 <div className="ticket-wrapper">
      
      <div className="ticket-main">
        <div className="tm-header">
          {/* <div className="tm-block">
            <span className="tm-label">VOUCHER TYPE</span>
            <span className="tm-value"></span>
          </div> */}

          <div className="tm-block border-left">
            <span className="tm-label">VALID THRU</span>
            <span className="tm-value">12/26</span>
          </div>
          <div className="tm-block border-left">
            <span className="tm-label">STATUS</span>
            <span className="tm-value active-badge">ACTIVE</span>
          </div>
        </div>

        <div className="tm-hero">
          <div className="tm-title-wrapper">
            <h2>COMMISSION</h2>
            <h2>DISCOUNT VOUCHER <span className="asterisk"></span></h2>
          </div>
          <div className="tm-amount">
            <span className="digits">$100</span>
          </div>
        </div>
        <div className="tm-stats-section">
          <div className="tm-stats-row">
            <div className="stat-box">
              <span className="stat-lbl">REDEEMED</span>
              <span className="stat-val">${voucherUsed}</span>
            </div>
            <div className="stat-box right-align">
              <span className="stat-lbl">REMAINING</span>
              <span className="stat-val highlight">${remaining}</span>
            </div>
          </div>
{/*           
          <div className="tm-progress-track">
            <div className="tm-progress-fill" style={{ width: progressPercent + "%" }}></div>
            <div className="tm-progress-grid"></div>
          </div> */}
        </div>
      </div>

      <div className="ticket-rip">
        <div className="hole hole-top"></div>
        <div className="rip-line"></div>
        <div className="hole hole-bottom"></div>
      </div>

      <div className="ticket-stub">
        <div className="ts-top">
          <div className="ts-serial">NO. 847291</div>
          <div className="ts-barcode"></div>
          <div className="ts-code">{}</div>
        </div>
        <div className="ts-bottom">
        </div>
      </div>

    </div>

 <div className="voucher-container">
    
      {/* НИЖНЯЯ ЧАСТЬ: ЭЛИТНАЯ СТАТИСТИКА */}
      <div className="details-section">
        
        <div className="details-group">
          <h3 className="group-title">USAGE STATISTICS</h3>
          <div className="stats-list">
            <div className="stats-item">
              <span className="s-label">Applied to trades</span>
              <span className="s-dots"></span>
              <span className="s-value">{tradesCount + ' Executed'}</span>
            </div>
            <div className="stats-item">
              <span className="s-label">Total cashback returned</span>
              <span className="s-dots"></span>
              <span className="s-value">{'$ ' + redeemed.toFixed(2)}</span>
            </div>
            <div className="stats-item">
              <span className="s-label">Available limit</span>
              <span className="s-dots"></span>
              <span className="s-value">{'$ ' + remainingActive.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="details-group">
          <h3 className="group-title">TIME REMAINING</h3>
          <div className="live-counter">
            <span className="pulse-dot"></span>
            <span className="time-string">{formatTime()}</span>
          </div>
        </div><div className="details-group">
          <h3 className="group-title">DOCUMENTATION</h3>
          <div className="doc-links">
            <div className="doc-item">
              <span className="d-id">{'ID: VCH-' + ticketId + '-PRO'}</span>
              <span className="d-tag">OFFICIAL</span>
            </div>
            <p className="doc-text">
              This voucher reduces trading commission by 100%. Applied automatically 
              to all pairs. Refund is processed in USDT to your main balance.
            </p>
            <div className="legal-row">
              <a href="#terms">Terms of Use</a>
              <span className="sep">•</span>
              <a href="#privacy">Privacy Policy</a>
            </div>
          </div>
        </div>

      </div>
    </div>


</div>);
};

export default Bonus;