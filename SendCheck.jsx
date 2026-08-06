import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authFetch } from "./apiClient";

function LogoMark(props) {
  var cls = props.className || "";
  return (
    <g className={cls}>
      <path d="M 462 350 C 465 510 466 670 470 820 C 472 900 475 970 478 1035"></path>
      <path d="M 660 360 C 663 520 665 680 670 830 C 675 920 680 1010 686 1085"></path>
      <path d="M 125 985 C 220 865 330 760 470 690 C 600 625 735 575 850 585 C 905 590 935 615 900 655 C 830 725 700 800 560 865 C 450 915 350 960 250 970"></path>
      <path d="M 245 970 C 330 975 405 970 470 970 C 545 970 615 1015 690 1085"></path>
    </g>
  );
}

function SendIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="8 7 17 7 17 16"></polyline>
    </svg>
  );
}
function ReceiveIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="7" x2="7" y2="17"></line>
      <polyline points="16 17 7 17 7 8"></polyline>
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12.5 9.5 18 20 6"></polyline>
    </svg>
  );
}

const SendCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const transferId = location.state && location.state.transferId;

  var [detail, setDetail] = useState(null);
  var [errorMsg, setErrorMsg] = useState(null);
  var [copied, setCopied] = useState(false);

  useEffect(function () {
    if (!transferId) {
      setErrorMsg("No transfer specified");
      return;
    }
    authFetch("/transfers/detail?id=" + transferId)
      .then(setDetail)
      .catch(function (err) { setErrorMsg(err.message); });
  }, [transferId]);

  function handleClose() { navigate(-1); }

  function handleCopy() {
    if (!detail) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(detail.referenceCode).catch(function () {});
    }
    setCopied(true);
    setTimeout(function () { setCopied(false); }, 1500);
  }

  if (errorMsg) {
    return (
      <div className="SendCheckContent">
        <div className="sc-error">
          <span>{errorMsg}</span>
          <button className="sc-close-btn" onClick={handleClose}>Close</button>
        </div>
      </div>
    );
  }

  if (!detail) {
    return <div className="SendCheckContent"></div>;
  }

  var isSend = detail.direction === "send";
  var sign = isSend ? "-" : "+";
  var amountStr = sign + detail.amount.toFixed(2) + " USDT";
  var counterpartyLabel = isSend ? "TO" : "FROM";
  var typeLabel = isSend ? "Send" : "Receive";
  var dateObj = new Date(detail.createdAt);
  var dateStr = dateObj.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    + ", " + dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  var refShort = detail.referenceCode
    ? detail.referenceCode.slice(0, 4) + "..." + detail.referenceCode.slice(-6)
    : "";
  var iconClass = "sc-icon-circle " + (isSend ? "send" : "receive");
  var amountClass = "sc-amount " + (isSend ? "send" : "receive");

  return (
    <div className="SendCheckContent">
      <div className="sc-page">

        <div className={iconClass}>
          {isSend ? <SendIcon /> : <ReceiveIcon />}
        </div>

        <div className={amountClass}>{amountStr}</div>

        <div className="sc-success-pill">
          <span className="sc-success-dot"><CheckIcon /></span>
          <span>SUCCESS</span>
        </div>

        <div className="sc-divider"></div>

        <div className="sc-rows">
          <div className="sc-row">
            <span className="sc-label">AMOUNT</span>
            <span className="sc-value">{detail.amount.toFixed(2) + " USDT"}</span>
          </div>
          <div className="sc-row">
            <span className="sc-label">{counterpartyLabel}</span>
            <span className="sc-value">{"@" + detail.counterpartyUsername}</span>
          </div>
          <div className="sc-row">
            <span className="sc-label">TRANSACTION ID</span>
            <span className="sc-value sc-copy-row" onClick={handleCopy}>
              {refShort}
              <span className="sc-copy-icon">{copied ? <CheckIcon /> : <CopyIcon />}</span>
            </span>
          </div>
          <div className="sc-row">
            <span className="sc-label">DATE &amp; TIME</span>
            <span className="sc-value">{dateStr}</span>
          </div>
          <div className="sc-row">
            <span className="sc-label">FEE</span>
            <span className="sc-value">0.00 USDT</span>
          </div>
          <div className="sc-row">
            <span className="sc-label">STATUS</span>
            <span className="sc-value sc-status-val">{detail.status.toUpperCase()}</span>
          </div>
          <div className="sc-row">
            <span className="sc-label">TYPE</span>
            <span className="sc-value">{typeLabel}</span>
          </div>
          {detail.xpAwarded > 0 && (
  <div className="sc-row">
    <span className="sc-label">BATTLE PASS XP</span>
    <span className="sc-value" style={{color: 'var(--xlavelia)'}}>{'+' + detail.xpAwarded}</span>
  </div>
)}
          <div className="sc-row">
            <span className="sc-label">NOTE</span>
            <span className="sc-value sc-dim">—</span>
          </div>
        </div>
<div className="sc-stamp">

  <div className="sc-stamp-text">
    <span>xwallet own</span>
    <span>your flow</span>
  </div>
</div>

        <div className="sc-wordmark">
          <span>xwallet</span>
        </div>

        <button className="sc-close-btn" onClick={handleClose}>Close</button>

      </div>
    </div>
  );
};

export default SendCheck;