import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";


const Referral = () => {

const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };

  // Данные реферальной программы
  const referralCode = 'x71c45';
  const friendsInvited = 24;
  const activeTraders = 18;
  const totalFriendsVolume = 4520.90;
  const referralRate = 0.3; // 0.3%
  const totalEarnings = 136.00;
  const lastPayout = '2 hours';

  return (<div className="ReferralContent">
    <div className="ref-page-wrapper">
<div className="Road-Home" onClick={roadHome}></div>


      {/* PARTNER CARD (Верхний блок) */}
      <div className="partner-card">
        <div className="pc-main">
          <div className="pc-top">
            <div className="pc-label-group">
              <span className="pc-label">MEMBERSHIP TIER</span>
              <span className="pc-tier">ELITE PARTNER</span>
            </div>
            <div className="pc-rate-box">
              <span className="pc-rate-val">{referralRate + '%'}</span>
              <span className="pc-rate-label">COMMISSION</span>
            </div>
          </div>

          <div className="pc-center">
            <span className="pc-label">YOUR REFERRAL CODE</span>
            <div className="pc-code-display">
              <span className="pc-code">{referralCode}</span>
              <button className="pc-copy-btn">COPY</button>
            </div>
          </div>

         
        </div>

        <div className="pc-side">
          <div className="pc-barcode-mini"></div>
        </div>
      </div>

      {/* STATISTICS SECTION (Нижний блок) */}
      <div className="ref-details">
        
        <div className="details-group">
          <h3 className="group-title">NETWORK GROWTH</h3>
          <div className="stats-list">
            <div className="stats-item">
              <span className="s-label">Friends invited</span>
              <span className="s-dots"></span>
              <span className="s-value">{friendsInvited + ' users'}</span>
            </div>
            <div className="stats-item">
              <span className="s-label">Active traders</span>
              <span className="s-dots"></span>
              <span className="s-value">{activeTraders + ' active'}</span>
            </div>
            <div className="stats-item">
              <span className="s-label">Conversion rate</span>
              <span className="s-dots"></span>
              <span className="s-value">75%</span>
            </div>
          </div>
        </div>

        <div className="details-group">
          <h3 className="group-title">TRADING VOLUME</h3>
          <div className="stats-list">
            <div className="stats-item">
              <span className="s-label">Total friends turnover</span>
              <span className="s-dots"></span>
              <span className="s-value">{'$ ' + totalFriendsVolume.toLocaleString()}</span>
            </div>
            <div className="stats-item">
              <span className="s-label">Your share (0.3%)</span>
              <span className="s-dots"></span>
              <span className="s-value">{'$ ' + totalEarnings.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="details-group"><h3 className="group-title">PARTNER POLICY</h3>
          <div className="policy-box">
            <p className="policy-text">
              Partners receive a fixed 0.3% from every successful trade executed by 
              their referrals. Rewards are credited instantly to the main balance. 
              Multiple accounts are strictly prohibited.
            </p>
            <div className="legal-links">
              <a href="#rules">Rules</a>
              <span className="sep">/</span>
              <a href="#support">Support</a>
              <span className="sep">/</span>
              <a href="#privacy">Privacy</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>);
};

export default Referral;