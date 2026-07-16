import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "./useBalance";

const Get = () => {
  const navigate = useNavigate();

  var profile  = useProfile();
  var [network, setNetwork]   = useState("ERC20");
  var [copyDone, setCopyDone] = useState(false);

  function roadHome() { navigate("/"); }

  var walletId    = profile.id;
  var btcAddress  = "bc1qxy2kgsv6dnvce47rj6gvcs7m3wjm0yu8a";
  var ethAddress  = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
  var solAddress  = "GvT97vf46scxR4n";
  var cardNumber  = "7901 2837 9272 4581";
  var cardNumber2 = "1234 9991 8738 1234";

  var activeAddress = ethAddress;
  if (network === "BTC") activeAddress = btcAddress;
  if (network === "SOL") activeAddress = solAddress;

  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(walletId).catch(function () {});
    }
    setCopyDone(true);
    setTimeout(function () { setCopyDone(false); }, 1500);
  }

  var copyLabel = copyDone ? "Copied!" : "Copy ID";

  var btnBTC  = network === "BTC"   ? "get-net-btn active" : "get-net-btn";
  var btnERC  = network === "ERC20" ? "get-net-btn active" : "get-net-btn";
  var btnSOL  = network === "SOL"   ? "get-net-btn active" : "get-net-btn";

  return (
    <div className="GetContent">

      <div className="get-page">
        <div className="get-content">

          <div className="get-info-card">
            <div className="get-row">
              <span className="get-label">Your Wallet ID</span>
              <span className="get-value get-id-mono">{walletId}</span>
            </div>
            {/* <div className="get-id-hint">Share this ID so others can send you USDT</div> */}
            {/* <button className="get-copy-id-btn" onClick={handleCopy}>{copyLabel}</button> */}

            <div className="get-row" style={{marginTop: "14px"}}>
              <span className="get-label">Card 1 Number</span>
              <span className="get-value">{cardNumber}</span>
            </div>
            <div className="get-row">
              <span className="get-label">Card 2 Number</span>
              <span className="get-value">{cardNumber2}</span>
            </div>

            <div className="get-divider"></div>

            <div className="get-address-box">
              <span className="get-label">Deposit Address (crypto)</span>
              <div className="get-address-text">{activeAddress}</div>
            </div>
          </div>

          <div className="get-network-selector">
            <button className={btnBTC}  onClick={() => setNetwork("BTC")}>BTC</button>
            <button className={btnERC}  onClick={() => setNetwork("ERC20")}>ERC20</button>
            <button className={btnSOL}  onClick={() => setNetwork("SOL")}>SOLANA</button>
          </div>

          <div className="get-qr-container">
            <div className="get-qr-frame">
              <div className="get-qr-mock">
                <div className="qr-corner top-left"></div>
                <div className="qr-corner top-right"></div>
                <div className="qr-corner bottom-left"></div>
                <div className="qr-corner bottom-right"></div>
                <div className="qr-center-icon">✦</div>
              </div>
            </div>
            <p className="get-qr-hint">{"ID: " + walletId + " · Scan to receive"}</p>
          </div>

        </div>

        <div className="get-action-area">
          <button className="get-copy-btn" onClick={handleCopy}>{copyLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default Get;
