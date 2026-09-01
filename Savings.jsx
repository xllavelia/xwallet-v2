import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletBalance } from "./useWallet";
import { useSavings, depositToSavings, withdrawFromSavings } from "./useSavings";

function GiftIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l9-4 9 4-9 4-9-4Z"></path><path d="M3 8v9l9 4 9-4V8"></path><line x1="12" y1="12" x2="12" y2="21"></line></svg>);
}
function DepositIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>);
}
function WithdrawIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>);
}

function formatEntryLabel(type) {
  if (type === "interest") return "Interest on balance";
  if (type === "deposit") return "Deposit";
  return "Withdrawal";
}
function groupByDate(history) {
  var groups = [];
  var map = {};
  history.forEach(function (item) {
    var d = new Date(item.createdAt);
    var key = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    if (!map[key]) { map[key] = []; groups.push({ label: key, items: map[key] }); }
    map[key].push(item);
  });
  return groups;
}

const Savings = () => {
  const navigate = useNavigate();
  function roadHome() { navigate(-1); }

  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var { savings, refresh: refreshSavings } = useSavings();

  var [activePanel, setActivePanel] = useState(null);
  var [amountInput, setAmountInput] = useState("");
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);
  var [isBusy, setIsBusy] = useState(false);

  if (!savings) {
    return <div className="SavingsContent"></div>;
  }

  function openPanel(kind) {
    setActivePanel(activePanel === kind ? null : kind);
    setAmountInput("");
    setStatusMsg(null);
  }

  async function handleSubmit() {
    var amt = parseFloat(amountInput);
    if (!amt || amt <= 0) { setStatusMsg("Enter a valid amount"); setStatusOk(false); return; }
    setIsBusy(true);
    try {
      if (activePanel === "deposit") {
        await depositToSavings(amt);
        setStatusMsg("Deposited $" + amt.toFixed(2));
      } else {
        await withdrawFromSavings(amt);
        setStatusMsg("Withdrew $" + amt.toFixed(2));
      }
      setStatusOk(true);
      setAmountInput("");
      refreshWallet();
      refreshSavings();
      setTimeout(function () { setActivePanel(null); setStatusMsg(null); }, 1200);
    } catch (err) {
      setStatusMsg(err.message);
      setStatusOk(false);
    } finally {
      setIsBusy(false);
    }
  }

  var groups = groupByDate(savings.history);
  var rate = savings.interestRate;
  var estDaily = savings.balance * (rate / 100) / 365;
  var estMonthly = savings.balance * (rate / 100) / 12;
  var estYearly = savings.balance * (rate / 100);

  var totalDeposited = savings.history.filter(function (h) { return h.entryType === "deposit"; }).reduce(function (acc, h) { return acc + h.amount; }, 0);
  var totalWithdrawn = savings.history.filter(function (h) { return h.entryType === "withdrawal"; }).reduce(function (acc, h) { return acc + h.amount; }, 0);

  return (
    <div className="SavingsContent">
      <div className="Road-Home" onClick={roadHome}></div>

      <div className="sav-page">

        <div className="sav-header">
          <span className="sav-eyebrow">Wallet</span>
          <h1 className="sav-title">Savings Account</h1>
        </div>

        <div className="sav-balance-block">
          <span className="sav-balance-val">{"$" + savings.balance.toFixed(2)}</span>
          <div className="sav-meta-row">
            <span>{"Interest rate: " + rate + "%"}</span>
            <span>{"Accrued: $" + savings.totalAccrued.toFixed(2)}</span>
          </div>
        </div>

        <div className="sav-actions-pill">
          <button className={"sav-action-btn " + (activePanel === "deposit" ? "active" : "")} onClick={() => openPanel("deposit")}>
            <DepositIcon /><span>Deposit</span>
          </button>
          <button className={"sav-action-btn " + (activePanel === "withdraw" ? "active" : "")} onClick={() => openPanel("withdraw")}>
            <WithdrawIcon /><span>Withdraw</span>
          </button>
        </div>

        {activePanel && (
          <div className="sav-input-panel">
            <div className="sav-input-row">
              <span className="sav-input-currency">$</span>
              <input type="number" className="sav-input" placeholder="0.00" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} autoFocus />
            </div>
            <span className="sav-input-hint">
              {activePanel === "deposit"
                ? ("Available in wallet: $" + wallet.balance.toFixed(2))
                : ("Available in savings: $" + savings.balance.toFixed(2))}
            </span>
            {statusMsg && <div className={"sav-status " + (statusOk ? "ok" : "err")}>{statusMsg}</div>}
            <button className="sav-submit-btn" disabled={isBusy} onClick={handleSubmit}>
              {isBusy ? "Processing..." : (activePanel === "deposit" ? "Confirm Deposit" : "Confirm Withdrawal")}
            </button>
          </div>
        )}

        <div className="sav-stats-block">
          <span className="sav-stats-title">Earnings Overview</span>
          <div className="sav-stats-list">
            <div className="sav-stats-item"><span className="sav-s-label">Est. daily earnings</span><span className="sav-s-dots"></span><span className="sav-s-value">{"$" + estDaily.toFixed(2)}</span></div>
            <div className="sav-stats-item"><span className="sav-s-label">Est. monthly earnings</span><span className="sav-s-dots"></span><span className="sav-s-value">{"$" + estMonthly.toFixed(2)}</span></div>
            <div className="sav-stats-item"><span className="sav-s-label">Est. yearly earnings</span><span className="sav-s-dots"></span><span className="sav-s-value">{"$" + estYearly.toFixed(2)}</span></div>
            <div className="sav-stats-item"><span className="sav-s-label">Total deposited</span><span className="sav-s-dots"></span><span className="sav-s-value">{"$" + totalDeposited.toFixed(2)}</span></div>
            <div className="sav-stats-item"><span className="sav-s-label">Total withdrawn</span><span className="sav-s-dots"></span><span className="sav-s-value">{"$" + totalWithdrawn.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="sav-doc-box">
          <div className="sav-doc-top">
            <span className="sav-doc-title">About This Account</span>
            <span className="sav-doc-tag">12% APY</span>
          </div>
          <p className="sav-doc-text">
            Interest accrues daily on your balance and is added automatically. Deposit or
            withdraw at any time — moving funds between your Wallet and Savings never counts
            as spending or income in your History.
          </p>
        </div>

        <div className="sav-history">
          {groups.length === 0 && <div className="sav-empty">No activity yet — make your first deposit.</div>}
          {groups.map(function (group) {
            return (
              <div className="sav-history-group" key={group.label}>
                <span className="sav-group-label">{group.label}</span>
                {group.items.map(function (item) {
                  var isPositive = item.entryType !== "withdrawal";
                  return (
                    <div className="sav-entry" key={item.id}>
                      <div className={"sav-entry-icon " + item.entryType}>
                        {item.entryType === "interest" ? <GiftIcon /> : (item.entryType === "deposit" ? <DepositIcon /> : <WithdrawIcon />)}
                      </div>
                      <div className="sav-entry-info">
                        <span className="sav-entry-name">{formatEntryLabel(item.entryType)}</span>
                        <span className="sav-entry-sub">Savings Account</span>
                      </div>
                      <span className={"sav-entry-amount " + (isPositive ? "pos" : "neg")}>
                        {(isPositive ? "+$" : "-$") + item.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Savings;