import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePositions, useTradeHistory, closePositionById } from "./useBalance";

function safeNum(val) {
  var n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function migratePos(pos) {
  var amount   = safeNum(pos.amount);
  var leverage = safeNum(pos.leverage) || 1;
  var margin   = safeNum(pos.margin) || (leverage > 0 ? amount / leverage : 0);
  return {
    id:                pos.id || Date.now(),
    tradeId:           pos.tradeId || null,
    coin:              pos.coin || 'BTC',
    type:              pos.type || 'long',
    entryPrice:        safeNum(pos.entryPrice),
    leverage:          leverage,
    amount:            amount,
    margin:            margin,
    fees:              safeNum(pos.fees),
    feesPaidByVoucher: pos.feesPaidByVoucher || false,
    liqPrice:          safeNum(pos.liqPrice),
    openTime:          safeNum(pos.openTime) || Date.now(),
    autoClose:         pos.autoClose || false,
    autoCloseTarget:   safeNum(pos.autoCloseTarget) || null
  };
}

function migrateClosedTrade(t) {
  var amount   = safeNum(t.amount);
  var leverage = safeNum(t.leverage) || 1;
  var margin   = safeNum(t.margin) || (leverage > 0 ? amount / leverage : 0);
  return {
    id:                t.id || Date.now(),
    tradeId:           t.tradeId || null,
    coin:              t.coin || 'BTC',
    type:              t.type || 'long',
    entryPrice:        safeNum(t.entryPrice),
    closePrice:        safeNum(t.closePrice),
    leverage:          leverage,
    amount:            amount,
    margin:            margin,
    fees:              safeNum(t.fees),
    feesPaidByVoucher: t.feesPaidByVoucher || false,
    pnl:               safeNum(t.pnl),
    pnlPercent:        safeNum(t.pnlPercent),
    liqPrice:          safeNum(t.liqPrice),
    openTime:          safeNum(t.openTime),
    closeTime:         safeNum(t.closeTime),
    duration:          safeNum(t.duration),
    result:            t.result || (safeNum(t.pnl) >= 0 ? 'win' : 'loss')
  };
}

const History = () => {
  const navigate     = useNavigate();
  const rawPositions = usePositions();
  const rawHistory   = useTradeHistory();

  const positions    = rawPositions.map(migratePos);
  const tradeHistory = rawHistory.map(migrateClosedTrade);

  const [activeTab,             setActiveTab]             = useState('transactions');
  const [selectedCompletedTrade, setSelectedCompletedTrade] = useState(null);
  const [selectedActivePosId,    setSelectedActivePosId]   = useState(null);
  const [livePrices,             setLivePrices]            = useState({});

  function roadHome() { navigate("/"); }

  useEffect(function() {
    if (positions.length === 0) return;
    var uniqueCoins = [];
    positions.forEach(function(p) { if (uniqueCoins.indexOf(p.coin) === -1) uniqueCoins.push(p.coin); });
    var symbols = JSON.stringify(uniqueCoins.map(function(c) { return c + 'USDT'; }));
    function doFetch() {
      fetch('https://api.binance.com/api/v3/ticker/price?symbols=' + symbols)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var prices = {};
          data.forEach(function(item) { prices[item.symbol.replace('USDT', '')] = parseFloat(item.price); });
          setLivePrices(prices);
        })
        .catch(function() {});
    }
    doFetch();
    var interval = setInterval(doFetch, 10000);
    return function() { clearInterval(interval); };
  }, [positions.length]);

  function formatDuration(ms) {
    var s = Math.floor(safeNum(ms) / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (h > 0) return h + 'h ' + m + 'm';
    if (m > 0) return m + 'm ' + sec + 's';
    return sec + 's';
  }
  function formatDate(ts) {
    var n = safeNum(ts);
    if (n <= 0) return '--';
    return new Date(n).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function timeAgo(openTime) {
    var ms = Date.now() - safeNum(openTime);
    var h  = Math.floor(ms / 3600000);
    var m  = Math.floor((ms % 3600000) / 60000);
    if (h > 0) return h + 'h ' + m + 'm ago';
    if (m > 0) return m + 'm ago';
    return 'just now';
  }

  var positionCards = positions.map(function(pos) {
    var livePrice = livePrices[pos.coin] || 0;
    var pnl = livePrice > 0 && pos.entryPrice > 0 && pos.margin > 0
      ? pos.margin * pos.leverage * ((livePrice - pos.entryPrice) / pos.entryPrice) * (pos.type === 'long' ? 1 : -1)
      : 0;
    var pnlPct = pos.margin > 0 ? (pnl / pos.margin) * 100 : 0;
    var sign   = pnl >= 0 ? '+' : '';
    return {
      id:                pos.id,
      tradeId:           pos.tradeId,
      coin:              pos.coin,
      type:              pos.type,
      leverage:          pos.leverage,
      entryPrice:        pos.entryPrice,
      liqPrice:          pos.liqPrice,
      margin:            pos.margin,
      amount:            pos.amount,
      fees:              pos.fees,
      feesPaidByVoucher: pos.feesPaidByVoucher,
      autoClose:         pos.autoClose,
      autoCloseTarget:   pos.autoCloseTarget,
      livePrice:         livePrice,
      pnl:               pnl,
      pnlStr:            sign + '$' + pnl.toFixed(2),
      pnlPctStr:         sign + pnlPct.toFixed(2) + '%',
      pnlClass:          pnl >= 0 ? 'pos' : 'neg',
      typeClass:         'et-pos-badge ' + pos.type,
      entryStr:          '$' + pos.entryPrice.toLocaleString('en-US'),
      liqStr:            '$' + Math.round(pos.liqPrice).toLocaleString('en-US'),
      livePriceStr:      livePrice > 0 ? '$' + livePrice.toLocaleString('en-US') : '--',
      marginStr:         '$' + pos.margin.toFixed(2),
      openedAgo:         timeAgo(pos.openTime)
    };
  });

  var managedPos = null;
  for (var k = 0; k < positionCards.length; k++) {
    if (positionCards[k].id === selectedActivePosId) { managedPos = positionCards[k]; break; }
  }

  function handleCloseFromHistory() {
    if (!managedPos || managedPos.livePrice <= 0) return;
    closePositionById(managedPos.id, managedPos.livePrice);
    setSelectedActivePosId(null);
  }
  function handleDuplicate() {
    if (!managedPos) return;
    navigate('/order', { state: { coin: managedPos.coin, type: managedPos.type, price: managedPos.livePrice > 0 ? managedPos.livePrice.toString() : managedPos.entryPrice.toString(), change: '+0.00%', leverage: managedPos.leverage, amount: managedPos.amount } });
  }
  function handleGoToChart() {
    if (!managedPos) return;
    navigate('/trade', { state: { coin: managedPos.coin } });
  }

  var sel = selectedCompletedTrade;
  var selPnl     = sel ? sel.pnl    : 0;
  var selPnlPct  = sel ? sel.pnlPercent : 0;
  var selMargin  = sel ? sel.margin : 0;
  var selAmount  = sel ? sel.amount : 0;
  var selFees    = sel ? sel.fees   : 0;
  var selRoi     = selAmount > 0 ? (selPnl / selAmount) * 100 : 0;
  var selSign    = selPnl >= 0 ? '+' : '';
  var selPnlStr        = sel ? selSign + '$' + selPnl.toFixed(2) : '';
  var selPnlPctStr     = sel ? selSign + selPnlPct.toFixed(2) + '%' : '';
  var selPnlClass      = sel ? (selPnl >= 0 ? 'ht-detail-pnl pos' : 'ht-detail-pnl neg') : '';
  var selTypeClass     = sel ? ('et-pos-badge ' + (sel.type || 'long')) : '';
  var selResultClass   = sel ? ('ht-result-badge ' + (sel.result || 'loss')) : '';
  var selEntryStr      = sel ? '$' + sel.entryPrice.toLocaleString('en-US') : '';
  var selCloseStr      = sel ? '$' + sel.closePrice.toLocaleString('en-US') : '';
  var selLiqStr        = sel ? '$' + Math.round(sel.liqPrice).toLocaleString('en-US') : '';
  var selMarginStr     = sel ? '$' + selMargin.toFixed(2) : '';
  var selAmountStr     = sel ? '$' + selAmount.toFixed(2) : '';
  var selFeesStr       = sel ? (sel.feesPaidByVoucher ? 'Covered by Voucher' : '$' + selFees.toFixed(2)) : '';
  var selLevStr        = sel ? sel.leverage + 'x' : '';
  var selRoiStr        = sel ? (selRoi >= 0 ? '+' : '') + selRoi.toFixed(2) + '%' : '';
  var selDurationStr   = sel ? formatDuration(sel.duration) : '';
  var selOpenDate      = sel ? formatDate(sel.openTime) : '';
  var selCloseDate     = sel ? formatDate(sel.closeTime) : '';

  var managedPnlClass  = managedPos ? (managedPos.pnl >= 0 ? 'ht-detail-pnl pos' : 'ht-detail-pnl neg') : '';
  var managedTypeClass = managedPos ? ('et-pos-badge ' + managedPos.type) : '';
  var managedAcStr     = managedPos && managedPos.autoClose && managedPos.autoCloseTarget
    ? 'TP +' + managedPos.autoCloseTarget + '%' : 'Off';

  var transactionsDB = [
    { id: 1, name: "Get USDT",  network: "mainnet", date: "October 17, 09:00 PM", amount: "44.80",  bonus: "44.80$", icon: "↓" },
    { id: 2, name: "Get BTC",   network: "btc",     date: "October 15, 08:15 AM", amount: "0.07",   bonus: "560$",   icon: "↓" },
    { id: 3, name: "Send ETH",  network: "erc20",   date: "October 16, 12:30 PM", amount: "-0.85",  bonus: "3450$",  icon: "↑" },
    { id: 4, name: "Send SOL",  network: "solana",  date: "October 17, 02:30 PM", amount: "-7.00",  bonus: "689$",   icon: "↑" }
  ];
  var swapDB = [
    { id: 1, name: "Bitcoin",  nameSwap: "usdt",   amount: "+0.003", bonus: "-650",   icon: "⇄" },
    { id: 2, name: "Ethereum", nameSwap: "solana", amount: "+0.90",  bonus: "-25",    icon: "⇄" },
    { id: 3, name: "Usdt",     nameSwap: "Ton",    amount: "+700",   bonus: "-2.3",   icon: "⇄" },
    { id: 4, name: "Solana",   nameSwap: "btc",    amount: "+8.32",  bonus: "-0.076", icon: "⇄" }
  ];

  return (
    <div className="HistoryContent">
      <div className="Road-Home" onClick={roadHome}></div>

      {managedPos && (
        <div className="ht-detail-overlay" onClick={() => setSelectedActivePosId(null)}>
          <div className="ht-detail-modal" onClick={function(e) { e.stopPropagation(); }}>
            <div className="ht-detail-handle"></div>
            <div className="ht-detail-top">
              <span className={managedTypeClass}>{managedPos.type.toUpperCase()}</span>
              <span className="ht-detail-coin">{managedPos.coin}</span>
              <span className="et-pos-lev">{managedPos.leverage + 'x'}</span>
              <span className="ht-active-badge">LIVE</span>
              <button className="ht-detail-close" onClick={() => setSelectedActivePosId(null)}>✕</button>
            </div>
            <div className={managedPnlClass}>
              <span className="ht-detail-pnl-val">{managedPos.pnlStr}</span>
              <span className="ht-detail-pnl-pct">{managedPos.pnlPctStr}</span>
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-detail-grid">
              <div className="ht-detail-row"><span className="ht-dl">Entry Price</span><span className="ht-dv">{managedPos.entryStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Current Price</span><span className="ht-dv">{managedPos.livePriceStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Liq. Price</span><span className="ht-dv ht-dv-liq">{managedPos.liqStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Margin</span><span className="ht-dv">{managedPos.marginStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Position Size</span><span className="ht-dv">{'$' + managedPos.amount.toFixed(2)}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Fees</span><span className="ht-dv">{managedPos.feesPaidByVoucher ? 'Voucher' : '$' + managedPos.fees.toFixed(2)}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Auto Close</span><span className="ht-dv">{managedAcStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Opened</span><span className="ht-dv ht-dv-date">{managedPos.openedAgo}</span></div>
              {managedPos.tradeId && <div className="ht-detail-row"><span className="ht-dl">Trade ID</span><span className="ht-dv et-pmv-id">{managedPos.tradeId}</span></div>}
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-action-row">
              <button className="ht-chart-btn"      onClick={handleGoToChart}>Chart</button>
              <button className="ht-duplicate-btn"  onClick={handleDuplicate}>Duplicate</button>
              <button className="ht-close-btn-modal" onClick={handleCloseFromHistory}>Close</button>
            </div>
          </div>
        </div>
      )}

      {sel && (
        <div className="ht-detail-overlay" onClick={() => setSelectedCompletedTrade(null)}>
          <div className="ht-detail-modal" onClick={function(e) { e.stopPropagation(); }}>
            <div className="ht-detail-handle"></div>
            <div className="ht-detail-top">
              <span className={selTypeClass}>{(sel.type || 'long').toUpperCase()}</span>
              <span className="ht-detail-coin">{sel.coin}</span>
              <span className={selResultClass}>{sel.result === 'win' ? 'WIN' : 'LOSS'}</span>
              <button className="ht-detail-close" onClick={() => setSelectedCompletedTrade(null)}>✕</button>
            </div>
            <div className={selPnlClass}>
              <span className="ht-detail-pnl-val">{selPnlStr}</span>
              <span className="ht-detail-pnl-pct">{selPnlPctStr}</span>
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-detail-grid">
              <div className="ht-detail-row"><span className="ht-dl">Entry Price</span><span className="ht-dv">{selEntryStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Close Price</span><span className="ht-dv">{selCloseStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Liq. Price</span><span className="ht-dv ht-dv-liq">{selLiqStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Leverage</span><span className="ht-dv ht-dv-lev">{selLevStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Position Size</span><span className="ht-dv">{selAmountStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Margin Used</span><span className="ht-dv">{selMarginStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Fees</span><span className="ht-dv">{selFeesStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">ROI</span><span className="ht-dv">{selRoiStr}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Duration</span><span className="ht-dv">{selDurationStr}</span></div>
              {sel.tradeId && <div className="ht-detail-row"><span className="ht-dl">Trade ID</span><span className="ht-dv et-pmv-id">{sel.tradeId}</span></div>}
            </div>
            <div className="ht-detail-divider"></div>
            <div className="ht-detail-dates">
              <div className="ht-detail-row"><span className="ht-dl">Opened</span><span className="ht-dv ht-dv-date">{selOpenDate}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Closed</span><span className="ht-dv ht-dv-date">{selCloseDate}</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="history-screen">
        <div className="history-header"><h1>History</h1></div>

        <div className="history-tabs">
          <button className={'history-tab ' + (activeTab === 'transactions' ? 'active-tab' : '')} onClick={() => setActiveTab('transactions')}>
            <span style={{fontFamily: "Unbounded"}}>Txns</span>
          </button>
          <button className={'history-tab ' + (activeTab === 'swap' ? 'active-tab' : '')} onClick={() => setActiveTab('swap')}>
            <span style={{fontFamily: "Unbounded"}}>Swap</span>
          </button>
          <button className={'history-tab ht-tab-with-badge ' + (activeTab === 'active' ? 'active-tab' : '')} onClick={() => setActiveTab('active')}>
            <span style={{fontFamily: "Unbounded"}}>Active</span>
            {positions.length > 0 && <span className="ht-tab-badge">{positions.length}</span>}
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
                            <h4 className="home-history-name">{item.name} <span style={{color:"rgba(255,255,255,0.4)",fontSize:"0.8rem"}}>{item.network}</span></h4>
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

          {activeTab === 'active' && positions.length === 0 && (
            <div className="ht-empty">
              <span className="ht-empty-text">No active positions. Go trade!</span>
            </div>
          )}

          {activeTab === 'active' && positions.length > 0 && (
            <div className="home-history-wrapper-parent">
              <div className="home-history-wrapper">
                <div className="home-history-list">
                  {positionCards.map(function(card) {
                    return (
                      <div key={card.id} className="ht-active-card" onClick={() => setSelectedActivePosId(card.id)}>
                        <div className="ht-ac-glow" style={{background: card.pnl >= 0 ? 'rgba(0,212,170,0.05)' : 'rgba(255,68,102,0.05)'}}></div>
                        <div className="ht-ac-left">
                          <div className="ht-ac-header">
                            <span className={card.typeClass}>{card.type.toUpperCase()}</span>
                            <span className="ht-lev-tag">{card.leverage + 'x'}</span>
                            {card.feesPaidByVoucher && <span className="ht-voucher-badge">🎫</span>}
                            {card.autoClose && <span className="ht-ac-tp-badge">TP</span>}
                          </div>
                          <div className="ht-ac-coin">{card.coin}</div>
                          <div className="ht-ac-entry">{'Entry ' + card.entryStr + ' · ' + card.openedAgo}</div>
                          <div className="ht-ac-liq">{'Liq ' + card.liqStr}</div>
                        </div>
                        <div className="ht-ac-right">
                          <div className={'ht-ac-pnl ' + card.pnlClass}>{card.pnlStr}</div>
                          <div className={'ht-ac-pct ' + card.pnlClass}>{card.pnlPctStr}</div>
                          <div className="ht-ac-live-price">{card.livePriceStr}</div>
                          <div className="ht-ac-tap">tap ›</div>
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
              <span className="ht-empty-text">No closed trades yet.</span>
            </div>
          )}

          {activeTab === 'completed' && tradeHistory.length > 0 && (
            <div className="home-history-wrapper-parent">
              <div className="home-history-wrapper">
                <div className="home-history-list">
                  {tradeHistory.map(function(item) {
                    var sign       = item.pnl >= 0 ? '+' : '';
                    var pnlDisplay = sign + '$' + item.pnl.toFixed(2);
                    var pctDisplay = sign + item.pnlPercent.toFixed(2) + '%';
                    var bg         = item.pnl >= 0 ? '#26a17b' : '#ff5e62';
                    var closeTime  = item.closeTime;
                    var dateStr    = closeTime > 0
                      ? new Date(closeTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : '--';
                    return (
                      <div key={item.id} className="home-history-item ht-trade-row" onClick={() => setSelectedCompletedTrade(item)}>
                        <div className="home-history-left">
                          <div className="home-history-info">
                            <div className="ht-active-top">
                              <h4 className="home-history-name-active">{item.coin}</h4>
                              <span className={'et-pos-badge ' + item.type}>{item.type.toUpperCase()}</span>
                              {item.feesPaidByVoucher && <span className="ht-voucher-badge">🎫</span>}
                            </div>
                            <span className="home-history-date-active"><span style={{color:"rgba(255,255,255,0.4)"}}>{dateStr}</span></span>
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
