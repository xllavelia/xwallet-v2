import React, { useState, useEffect } from "react";
import { useVoucherUsed, writeVoucherUsed, VOUCHER_TOTAL } from './useBalance';
import { useNavigate } from "react-router-dom";

var VOUCHER_DURATION  = 345600;
var VOUCHER_START_KEY = 'voucher_start_time';

function readStartTime() {
  var s = localStorage.getItem(VOUCHER_START_KEY);
  return s ? parseInt(s) : null;
}

function calcTimeLeft(startTime) {
  if (!startTime) return 0;
  var elapsed = Math.floor((Date.now() - startTime) / 1000);
  return Math.max(0, VOUCHER_DURATION - elapsed);
}

const Bonus = () => {
  const navigate = useNavigate();

  var voucherUsed     = useVoucherUsed();
  var remaining       = parseFloat((VOUCHER_TOTAL - voucherUsed).toFixed(2));
  var remainingActive = remaining;
  var redeemed        = parseFloat(voucherUsed);

  var storedStart = readStartTime();

  var [activated, setActivated] = useState(storedStart !== null);
  var [timeLeft,  setTimeLeft]  = useState(calcTimeLeft(storedStart));

  var isExpired = activated && timeLeft === 0;

  useEffect(function() {
    if (!activated) return;
    var iv = setInterval(function() {
      var start = readStartTime();
      setTimeLeft(calcTimeLeft(start));
    }, 1000);
    return function() { clearInterval(iv); };
  }, [activated]);

  function handleActivate() {
    if (activated) return;
    localStorage.setItem(VOUCHER_START_KEY, String(Date.now()));
    setActivated(true);
    setTimeLeft(VOUCHER_DURATION);
  }

  function handleReset() {
    localStorage.removeItem(VOUCHER_START_KEY);
    writeVoucherUsed(0);
    setActivated(false);
    setTimeLeft(0);
  }

  function roadHome() { navigate("/"); }

  var ticketId  = '847291';
  var tradesCount = redeemed > 0 ? Math.ceil(redeemed / 0.35) : 0;

  var statusLabel = isExpired ? 'EXPIRED' : (activated ? 'ACTIVE' : 'INACTIVE');
  var statusClass = isExpired ? 'expired-badge' : (activated ? 'active-badge' : 'inactive-badge');

  function formatTime() {
    var tl = timeLeft;
    var d  = Math.floor(tl / (3600 * 24));
    var h  = Math.floor((tl % (3600 * 24)) / 3600);
    var m  = Math.floor((tl % 3600) / 60);
    var s  = tl % 60;
    return d + 'd ' + h + 'h ' + m + 'm ' + s + 's';
  }

  return (
    <div className="BonusContent">
      <div className="Road-Home" onClick={roadHome}></div>

      <div className="ticket-wrapper">
        <div className="ticket-main">
          <div className="tm-header">
            <div className="tm-block border-left">
              <span className="tm-label">VALID THRU</span>
              <span className="tm-value">12/26</span>
            </div>
            <div className="tm-block border-left">
              <span className="tm-label">STATUS</span>
              <span className='tm-value '>{statusLabel}</span>
            </div>
          </div>

          <div className="tm-hero">
            <div className="tm-title-wrapper">
              <h2>COMMISSION</h2>
              <h2>DISCOUNT VOUCHER <span className="asterisk"></span></h2>
            </div>
            <div className="tm-amount">
              <span className="digits">$400</span>
            </div>
          </div>

          <div className="tm-stats-section">
            <div className="tm-stats-row">
              <div className="stat-box">
                <span className="stat-lbl">REDEEMED</span>
                <span className="stat-val">{'$' + redeemed.toFixed(2)}</span>
              </div>
              <div className="stat-box right-align">
                <span className="stat-lbl">REMAINING</span>
                <span className="stat-val highlight">{'$' + remaining.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ticket-rip">
          <div className="hole hole-top"></div>
          <div className="rip-line"></div>
          <div className="hole hole-bottom"></div>
        </div>

        <div className="ticket-stub">
          <div className="ts-top">
            <div className="ts-serial">{'NO. ' + ticketId}</div>
            <div className="ts-barcode-v"></div>
          </div>
          <div className="ts-bottom"></div>
        </div>

      </div>

      <div className="voucher-container">
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
              <span className={'pulse-dot ' + (isExpired ? 'expired' : (activated ? '' : 'inactive'))}></span>
              <span className="time-string">{activated && !isExpired ? formatTime() : (isExpired ? 'EXPIRED' : 'Not activated')}</span>
            </div>
          </div>

          <div className="details-group">
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
                <a href="#terms" onClick={handleReset}>Terms of Use</a>
                <span className="sep">·</span>
                <a href="#privacy">Privacy Policy</a>
              </div>
            </div>
          </div>

        {!activated && !isExpired && (
          <button className="voucher-activate-btn" onClick={handleActivate}>
            ACTIVATE VOUCHER
          </button>
        )}

        {isExpired && (
          <div className="voucher-expired-banner">
            This voucher has expired and can no longer be used.
          </div>
        )}

        {/* <button className="voucher-reset-btn" onClick={handleReset}>
          Reset Voucher
        </button> */}
        </div>
      </div>
    </div>
  );
};

export default Bonus;
