import React, { useState } from "react";
import { openCase } from "./useBattlePass";


function describeVoucher(v) {
  if (v.kind === "ref_xp_credit") return "+" + v.value + " Referral XP";
  if (v.kind === "fee_discount") return "$" + v.value + " fee-free (" + v.days + "d)";
  return v.kind;
}

const CaseOpenModal = (props) => {
  var rarity = props.rarity;
  var onClose = props.onClose;

  var [stage, setStage] = useState("faceDown");
  var [result, setResult] = useState(null);
  var [errorMsg, setErrorMsg] = useState(null);
  var [pageIndex, setPageIndex] = useState(0);

  function handleTapCard() {
    if (stage === "faceDown") {
      setStage("anticipating");
      return;
    }
    if (stage === "anticipating") {
      openCase(rarity)
        .then(function (res) { setResult(res); setStage("revealed"); })
        .catch(function (err) { setErrorMsg(err.message); setStage("error"); });
    }
  }

  var pages = [];
  if (result) {
    if (result.usdtAwarded > 0) pages.push({ label: "USDT", value: "+$" + result.usdtAwarded.toFixed(0) });
    if (result.lavxAwarded > 0) pages.push({ label: "LAVX", value: "+" + result.lavxAwarded.toFixed(0) });
    (result.vouchers || []).forEach(function (v) {
      pages.push({ label: "VOUCHER", value: describeVoucher(v) });
    });
    if (result.statusGranted) {
      pages.push({ label: "STATUS", value: result.statusGranted.toUpperCase() });
    }
  }
  var isLastPage = pageIndex === pages.length - 1;

  function handleNextPage() {
    if (isLastPage) { onClose(); return; }
    setPageIndex(pageIndex + 1);
  }

  var cardClass = "xco-card xco-" + rarity + " xco-stage-" + stage;

  return (
    <div className={"xco-overlay xco-" + rarity}>
      <div className="xco-backdrop"></div>

      {rarity === "legendary" && stage !== "faceDown" && (
        <div className="xco-particles">
          {Array.from({ length: 14 }).map(function (_, i) {
            return <span className={"xco-particle p" + (i % 7)} key={i}></span>;
          })}
        </div>
      )}

      {stage !== "revealed" && stage !== "error" && (
        <div className={cardClass} onClick={handleTapCard}>
          <div className="xco-card-inner">
            <div className="xco-card-back">
              <span className="xco-card-back-x">X</span>
              <span className="xco-card-back-rarity">{rarity.toUpperCase()}</span>
            </div>
          </div>
          <span className="xco-tap-hint">{stage === "faceDown" ? "TAP TO BEGIN" : "TAP AGAIN TO OPEN"}</span>
        </div>
      )}

      {stage === "error" && (
        <div className="xco-error-box">
          <span>{errorMsg}</span>
          <button className="xco-close-btn" onClick={onClose}>Close</button>
        </div>
      )}

      {stage === "revealed" && pages.length > 0 && (
        <div className="xco-reveal-wrap">
          <div className={"xco-reveal-card xco-" + rarity} key={pageIndex}>
            <span className="xco-reveal-kind">{pages[pageIndex].label}</span>
            <span className="xco-reveal-value">{pages[pageIndex].value}</span>
          </div>

          <div className="xco-reveal-dots">
            {pages.map(function (_, i) {
              return <span key={i} className={"xco-dot" + (i === pageIndex ? " active" : "")}></span>;
            })}
          </div>

          <button className="xco-next-btn" onClick={handleNextPage}>{isLastPage ? "CLOSE" : "NEXT"}</button>
        </div>
      )}
    </div>
  );
};

export default CaseOpenModal;