import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";


const Get = () => {
 const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };

 const [network, setNetwork] = useState('ERC20');


  const walletId = '921028279';
  const btcAddress = 'bc1qxy2kgsv6dnvce47rj6gvcs7m3wjm0yu8a';
  const ethAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  const solAddress = 'GvT97vf46scxR4n';
  const cardNumber = '7901 2837 9272 4581';
  const cardNumber2 = '1234 9991 8738 1234';


  // Логика выбора адреса
  let activeAddress = ethAddress;
  if (network === 'BTC') activeAddress = btcAddress;
  if (network === 'SOL') activeAddress = solAddress;


  return (<div className="GetContent">
<div className="Road-Home" onClick={roadHome}></div>

<div className="get-page">
     
      <div className="get-content">
        {/* КАРТОЧКА С ИНФОРМАЦИЕЙ */}
        <div className="get-info-card">
          <div className="get-row">
            <span className="get-label">Wallet ID</span>
            <span className="get-value">{walletId}</span>
          </div>
          <div className="get-row">
            <span className="get-label">Card 1 Number</span>
            <span className="get-value">{cardNumber}</span>
          </div>
           <div className="get-row">
            <span className="get-label">Card 2 Number</span>
            <span className="get-value">{cardNumber2}</span>
          </div>
          
          <div className="get-divider"></div>
          <div className="get-address-box">
            <span className="get-label">Your Deposit Address</span>
            <div className="get-address-text">{activeAddress}</div>
          </div>
        </div>

        {/* ВЫБОР СЕТИ */}
        <div className="get-network-selector">
          <button 
            className={network === 'BTC' ? 'get-net-btn active' : 'get-net-btn'} 
            onClick={() => setNetwork('BTC')}
          >
            BTC
          </button>
          <button 
            className={network === 'ERC20' ? 'get-net-btn active' : 'get-net-btn'} 
            onClick={() => setNetwork('ERC20')}
          >
            ERC20
          </button>
          <button 
            className={network === 'SOL' ? 'get-net-btn active' : 'get-net-btn'} 
            onClick={() => setNetwork('SOL')}
          >
            SOLANA
          </button>
        </div>

        {/* QR КОД (БОЛЬШОЙ ВНИЗУ) */}
        <div className="get-qr-container">
          <div className="get-qr-frame">
            {/* Здесь будет настоящий QR, пока имитируем его элитным блоком */}
            <div className="get-qr-mock">
              <div className="qr-corner top-left"></div>
              <div className="qr-corner top-right"></div>
              <div className="qr-corner bottom-left"></div>
              <div className="qr-corner bottom-right"></div>
              <div className="qr-center-icon">✦</div>
            </div>
          </div>
          <p className="get-qr-hint">Scan to receive assets instantly</p>
        </div>
      </div>

      <div className="get-action-area">
        <button className="get-copy-btn">Copy Address</button>
      </div>
    </div>

</div>);
};

export default Get;