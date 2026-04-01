import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTradeHistory } from "./useBalance";

const History = () => {
  const navigate = useNavigate();
  const tradeHistory = useTradeHistory();

  const [activeTab, setActiveTab] = useState('transactions');
  const [selectedTrade, setSelectedTrade] = useState(null);

  function roadHome() { navigate("/"); }

  const transactionsDB = [
    { id: 1, name: "Get USDT",   network: "mainnet", date: "October 17, 09:00 PM", amount: "44.80",  bonus: "44.80$",  icon: "↓" },
    { id: 2, name: "Get BTC",    network: "btc",     date: "October 15, 08:15 AM", amount: "0.07",   bonus: "560$",    icon: "↓" },
    { id: 3, name: "Send ETH",   network: "erc20",   date: "October 16, 12:30 PM", amount: "-0.85",  bonus: "3450$",   icon: "↑" },
    { id: 4, name: "Send SOL",   network: "solana",  date: "October 17, 02:30 PM", amount: "-7.00",  bonus: "689$",    icon: "↑" }
  ];

  const swapDB = [
    { id: 1, name: "Bitcoin",   nameSwap: "usdt",   amount: "+0.003", bonus: "-650",   icon: "⇄" },
    { id: 2, name: "Ethereum",  nameSwap: "solana", amount: "+0.90",  bonus: "-25",    icon: "⇄" },
    { id: 3, name: "Usdt",      nameSwap: "Ton",    amount: "+700",   bonus: "-2.3",   icon: "⇄" },
    { id: 4, name: "Solana",    nameSwap: "btc",    amount: "+8.32",  bonus: "-0.076", icon: "⇄" }
  ];

  function formatDuration(ms) {
    var totalSec = Math.floor(ms / 1000);
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    if (h > 0) return h + 'h ' + m + 'm';
    if (m > 0) return m + 'm ' + s + 's';
    return s + 's';
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  var selectedDuration = selectedTrade ? formatDuration(selectedTrade.duration) : '';
  var selectedOpenDate = selectedTrade ? formatDate(selectedTrade.openTime) : '';
  var selectedCloseDate = selectedTrade ? formatDate(selectedTrade.closeTime) : '';
  var selectedEntryStr = selectedTrade ? '$' + selectedTrade.entryPrice.toLocaleString('en-US') : '';
  var selectedCloseStr = selectedTrade ? '$' + selectedTrade.closePrice.toLocaleString('en-US') : '';
  var selectedLiqStr = selectedTrade ? '$' + Math.round(selectedTrade.liqPrice).toLocaleString('en-US') : '';
  var selectedPnlSign = selectedTrade && selectedTrade.pnl >= 0 ? '+' : '';
  var selectedPnlStr = selectedTrade ? selectedPnlSign + '$' + selectedTrade.pnl.toFixed(2) : '';
  var selectedPnlPctStr = selectedTrade ? selectedPnlSign + selectedTrade.pnlPercent.toFixed(2) + '%' : '';
  var selectedMarginStr = selectedTrade ? '$' + selectedTrade.margin.toFixed(2) : '';
  var selectedFeesStr = selectedTrade ? '$' + selectedTrade.fees.toFixed(2) : '';
  var selectedAmountStr = selectedTrade ? '$' + (selectedTrade.amount || 0).toFixed(2) : '';
  var selectedPnlClass = selectedTrade ? (selectedTrade.pnl >= 0 ? 'ht-detail-pnl pos' : 'ht-detail-pnl neg') : '';
  var selectedTypeClass = selectedTrade ? ('et-pos-badge ' + selectedTrade.type) : '';
  var selectedResultClass = selectedTrade ? ('ht-result-badge ' + selectedTrade.result) : '';
  var selectedLevStr = selectedTrade ? selectedTrade.leverage + 'x' : '';
  var selectedRoi = selectedTrade ? ((selectedTrade.pnl / selectedTrade.amount) * 100) : 0;
  var selectedRoiStr = selectedTrade ? (selectedRoi >= 0 ? '+' : '') + selectedRoi.toFixed(2) + '%' : '';

  return (
    <div className="HistoryContent">
      <div className="Road-Home" onClick={roadHome}></div>

      {selectedTrade && (
        <div className="ht-detail-overlay" onClick={() => setSelectedTrade(null)}>
          <div className="ht-detail-modal" onClick={function(e) { e.stopPropagation(); }}>

            <div className="ht-detail-top">
              <span className={selectedTypeClass}>{selectedTrade.type.toUpperCase()}</span>
              <span className="ht-detail-coin">{selectedTrade.coin}</span>
              <span className={selectedResultClass}>{selectedTrade.result === 'win' ? 'WIN' : 'LOSS'}</span>
              <button className="ht-detail-close" onClick={() => setSelectedTrade(null)}>✕</button>
            </div>

            <div className={selectedPnlClass}>
              <span className="ht-detail-pnl-val">{selectedPnlStr}</span>
              <span className="ht-detail-pnl-pct">{selectedPnlPctStr}</span>
            </div>

            <div className="ht-detail-divider"></div>

            <div className="ht-detail-grid">
              <div className="ht-detail-row"><span className="ht-dl">Entry Price</span><span className="ht-dv">{selectedEntryStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Close Price</span><span className="ht-dv">{selectedCloseStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Liq. Price</span><span className="ht-dv ht-dv-liq">{selectedLiqStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Leverage</span><span className="ht-dv ht-dv-lev">{selectedLevStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Position Size</span><span className="ht-dv">{selectedAmountStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Margin Used</span><span className="ht-dv">{selectedMarginStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Fees Paid</span><span className="ht-dv ht-dv-fee">{selectedFeesStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">ROI</span><span className="ht-dv">{selectedRoiStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Duration</span><span className="ht-dv">{selectedDuration}</span></div>
            </div>

            <div className="ht-detail-divider"></div>

            <div className="ht-detail-dates">
              <div className="ht-detail-row"><span className="ht-dl">Opened</span><span className="ht-dv ht-dv-date">{selectedOpenDate}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Closed</span><span className="ht-dv ht-dv-date">{selectedCloseDate}</span></div>
            </div>

          </div>
        </div>
      )}

      <div className="history-screen">
        <div className="history-header"><h1>History</h1></div>

        <div className="history-tabs">
          <button className={'history-tab ' + (activeTab === 'transactions' ? 'active-tab' : '')} onClick={() => setActiveTab('transactions')}>
            <span style={{fontFamily: "Unbounded"}}>Transactions</span>
          </button>
          <button className={'history-tab ' + (activeTab === 'swap' ? 'active-tab' : '')} onClick={() => setActiveTab('swap')}>
            <span style={{fontFamily: "Unbounded"}}>Swap</span>
          </button>
          <button className={'history-tab ' + (activeTab === 'completed' ? 'active-tab' : '')} onClick={() => setActiveTab('completed')}>
            <span style={{fontFamily: "Unbounded"}}>Trades</span>
          </button>
        </div>

        <div className="history-content">

          {activeTab === 'transactions' && (
            <div className="home-history-wrapper-parent">
              <div className="home-history-wrapper">
                <div className="home-history-list">
                  {transactionsDB.map(function(item) {
                    return (
                      <div key={item.id} className="home-history-item">
                        <div className="home-history-left">
                          <div className="home-history-img">{item.icon}</div>
                          <div className="home-history-info">
                            <h4 className="home-history-name">{item.name} <span style={{color: "rgba(255,255,255,0.4)", fontSize: "0.8rem"}}>{item.network}</span></h4>
                            <span className="home-history-date">{item.date}</span>
                          </div>
                        </div>
                        <div className="home-history-right">
                          <h4 className="home-history-amount">{item.amount}</h4>
                          {item.bonus && <span className="home-history-bonus">{item.bonus}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'swap' && (
            <div className="home-history-wrapper-parent">
              <div className="home-history-wrapper">
                <div className="home-history-list">
                  {swapDB.map(function(item) {
                    return (
                      <div key={item.id} className="home-history-item">
                        <div className="home-history-left">
                          <div className="home-history-img">{item.icon}</div>
                          <div className="home-history-info">
                            <h4 className="home-history-name">{item.name}</h4>
                            <span className="home-history-date">{item.nameSwap}</span>
                          </div>
                        </div>
                        <div className="home-history-right">
                          <h4 className="home-history-amount">{item.amount}</h4>
                          {item.bonus && <span className="home-history-bonus">{item.bonus}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'completed' && tradeHistory.length === 0 && (
            <div className="ht-empty">
              <span className="ht-empty-icon">📭</span>
              <span className="ht-empty-text">No trades yet. Open your first position!</span>
            </div>
          )}

          {activeTab === 'completed' && tradeHistory.length > 0 && (
            <div className="home-history-wrapper-parent">
              <div className="home-history-wrapper">
                <div className="home-history-list">
                  {tradeHistory.map(function(item) {
                    var sign = item.pnl >= 0 ? '+' : '';
                    var pnlDisplay = sign + '$' + item.pnl.toFixed(2);
                    var pctDisplay = sign + item.pnlPercent.toFixed(2) + '%';
                    var bg = item.pnl >= 0 ? '#26a17b' : '#ff5e62';
                    var dateStr = new Date(item.closeTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={item.id} className="home-history-item ht-trade-row" onClick={() => setSelectedTrade(item)}>
                        <div className="home-history-left">
                          <div className="home-history-info">
                            <h4 className="home-history-name-active">{item.coin} <span style={{color: "hsl(61,80%,78%)", fontSize: "0.75rem"}}>closed</span></h4>
                            <span className="home-history-date-active">{item.type.toUpperCase()} <span style={{color: "rgba(255,255,255,0.4)"}}>{dateStr}</span></span>
                          </div>
                        </div>
                        <div className="home-history-right">
                          <h4 className="home-history-amount-active">{pnlDisplay}</h4>
                          <span className="home-history-bonus-active" style={{backgroundColor: bg}}>{pctDisplay}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default History;