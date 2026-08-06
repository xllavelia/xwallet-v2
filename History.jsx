import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePositionsRemote, useClosedPositionsRemote, closePosition } from "./usePositions";
import { useTransfersRemote } from "./useTransfers";
import { useCardHistory } from "./useCardHistory";

function safeNum(val) {
  var n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="8 7 17 7 17 16"></polyline>
    </svg>
  );
}
function ReceiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="7" x2="7" y2="17"></line>
      <polyline points="16 17 7 17 7 8"></polyline>
    </svg>
  );
}

const History = () => {
  const navigate = useNavigate();

  const { positions, refresh: refreshOpen } = usePositionsRemote();
  const { closedPositions } = useClosedPositionsRemote();
  const { transfers } = useTransfersRemote();
  const { history: cardHistory } = useCardHistory();
  const [selectedCardEntry, setSelectedCardEntry] = useState(null);

  const [activeTab, setActiveTab] = useState('transfers');
  const [selectedCompletedTrade, setSelectedCompletedTrade] = useState(null);
  const [selectedActivePosId, setSelectedActivePosId] = useState(null);
  const [livePrices, setLivePrices] = useState({});

  function roadHome() { navigate(-1); }

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

  function formatDuration(openedAt, closedAt) {
    var ms = new Date(closedAt).getTime() - new Date(openedAt).getTime();
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (h > 0) return h + 'h ' + m + 'm';
    if (m > 0) return m + 'm ' + sec + 's';
    return sec + 's';
  }
  function formatDate(iso) {
    if (!iso) return '--';
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function formatShortDate(iso) {
    if (!iso) return '--';
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

function coinGlyph(asset) {
  if (asset === "BTC") return (<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M17.06 11.57A3.9 3.9 0 0 0 18 9c0-1.86-1.27-3.43-3-3.87V3h-2v2h-2V3H9v2H6v2h2v10H6v2h3v2h2v-2h2v2h2v-2c2.21 0 4-1.79 4-4c0-1.45-.78-2.73-1.94-3.43M10 7h4c1.1 0 2 .9 2 2s-.9 2-2 2h-4zm5 10h-5v-4h5c1.1 0 2 .9 2 2s-.9 2-2 2" /></svg>)
  if (asset === "ETH") return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>)
  if (asset === "SOL") return (<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 18h12l4-4H8zm4-4l-4-4h12l4 4m-4-4l4-4H8l-4 4" /></svg>)
  if (asset === "TON") return (<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" /><path fill="currentColor" d="M17 3a2 2 0 0 1 1.492.668l.108.132l3.704 4.939a2 2 0 0 1-.012 2.416l-.108.13l-9.259 10.184a1.25 1.25 0 0 1-1.753.096l-.097-.096l-9.259-10.185a2 2 0 0 1-.215-2.407l.095-.138L5.4 3.8a2 2 0 0 1 1.43-.793L7 3zm-2.477 8H9.477L12 17.307zm5.217 0h-3.063l-2.406 6.015zM7.323 11H4.261l5.468 6.015zm5.059-6h-.764l-2 4h4.764zM17 5h-2.382l2 4H20zM9.382 5H7L4 9h3.382z" /></g></svg>)
  return "$";
}

function cardEntryLabel(item) {
  if (item.operationType === "buy") {
    return "Bought " + item.toAsset;
  }
  if (item.operationType === "sell") {
    return "Sold " + item.fromAsset;
  }
  return item.fromAsset + " → " + item.toAsset;
}

function cardEntryAmountStr(item) {
  if (item.operationType === "buy") {
    return "+" + item.toAmount.toFixed(6) + " " + item.toAsset;
  }
  if (item.operationType === "sell") {
    return "+$" + item.toAmount.toFixed(2);
  }
  return "+" + item.toAmount.toFixed(6) + " " + item.toAsset;
}

  function timeAgo(iso) {
    var ms = Date.now() - new Date(iso).getTime();
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
      openedAgo:         timeAgo(pos.openedAt)
    };
  });

  var managedPos = null;
  for (var k = 0; k < positionCards.length; k++) {
    if (positionCards[k].id === selectedActivePosId) { managedPos = positionCards[k]; break; }
  }

  function handleCloseFromHistory() {
    if (!managedPos || managedPos.livePrice <= 0) return;
    closePosition(managedPos.id, managedPos.livePrice).then(refreshOpen);
    setSelectedActivePosId(null);
  }
  function handleDuplicate() {
    if (!managedPos) return;
    navigate(-1);
    setTimeout(function () {
      navigate('/order', { state: { coin: managedPos.coin, type: managedPos.type, price: managedPos.livePrice > 0 ? managedPos.livePrice.toString() : managedPos.entryPrice.toString(), change: '+0.00%', leverage: managedPos.leverage, amount: managedPos.amount } });
    }, 20);
  }
  function handleGoToChart() {
    if (!managedPos) return;
    navigate(-1);
    setTimeout(function () {
      navigate('/trade', { state: { coin: managedPos.coin } });
    }, 20);
  }
  function handleOpenTransfer(transferId) {
    navigate('/sendcheck', { state: { transferId: transferId } });
  }

  var sel = selectedCompletedTrade;
  var selPnl     = sel ? safeNum(sel.pnl)    : 0;
  var selPnlPct  = sel ? safeNum(sel.pnlPercent) : 0;
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
  var selCloseStr      = sel ? '$' + (sel.closePrice || 0).toLocaleString('en-US') : '';
  var selLiqStr        = sel ? '$' + Math.round(sel.liqPrice).toLocaleString('en-US') : '';
  var selMarginStr     = sel ? '$' + selMargin.toFixed(2) : '';
  var selAmountStr     = sel ? '$' + selAmount.toFixed(2) : '';
  var selFeesStr       = sel ? (sel.feesPaidByVoucher ? 'Covered by Voucher' : '$' + selFees.toFixed(2)) : '';
  var selLevStr        = sel ? sel.leverage + 'x' : '';
  var selRoiStr        = sel ? (selRoi >= 0 ? '+' : '') + selRoi.toFixed(2) + '%' : '';
  var selDurationStr   = sel ? formatDuration(sel.openedAt, sel.closedAt) : '';
  var selOpenDate      = sel ? formatDate(sel.openedAt) : '';
  var selCloseDate     = sel ? formatDate(sel.closedAt) : '';

  var managedPnlClass  = managedPos ? (managedPos.pnl >= 0 ? 'ht-detail-pnl pos' : 'ht-detail-pnl neg') : '';
  var managedTypeClass = managedPos ? ('et-pos-badge ' + managedPos.type) : '';
  var managedAcStr     = managedPos && managedPos.autoClose && managedPos.autoCloseTarget
    ? 'TP +' + managedPos.autoCloseTarget + '%' : 'Off';

  return (
    <div className="HistoryContent">

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
            
            {sel.xpAwarded > 0 && (
  <div className="ht-detail-row"><span className="ht-dl">Battle Pass XP</span><span className="ht-dv" style={{color:'var(--xlavelia)'}}>{'+' + sel.xpAwarded}</span></div>
)}
            <div className="ht-detail-divider"></div>
            <div className="ht-detail-dates">
              <div className="ht-detail-row"><span className="ht-dl">Opened</span><span className="ht-dv ht-dv-date">{selOpenDate}</span></div>
              <div className="ht-detail-row"><span className="ht-dl">Closed</span><span className="ht-dv ht-dv-date">{selCloseDate}</span></div>
            </div>
          </div>
        </div>
      )}

{selectedCardEntry && (
  <div className="ht-detail-overlay" onClick={() => setSelectedCardEntry(null)}>
    <div className="ht-detail-modal" onClick={function(e) { e.stopPropagation(); }}>
      <div className="ht-detail-handle"></div>
      <div className="ht-detail-top">
        <span className={'et-pos-badge ' + (selectedCardEntry.operationType === 'sell' ? 'short' : 'long')}>
          {selectedCardEntry.operationType.toUpperCase()}
        </span>
        <span className="ht-detail-coin">
          {selectedCardEntry.operationType === 'swap'
            ? selectedCardEntry.fromAsset + ' → ' + selectedCardEntry.toAsset
            : (selectedCardEntry.operationType === 'buy' ? selectedCardEntry.toAsset : selectedCardEntry.fromAsset)}
        </span>
        <button className="ht-detail-close" onClick={() => setSelectedCardEntry(null)}>✕</button>
      </div>

      <div className="ht-detail-pnl pos">
        <span className="ht-detail-pnl-val">{cardEntryAmountStr(selectedCardEntry)}</span>
      </div>

      <div className="ht-detail-divider"></div>

      <div className="ht-detail-grid">
        <div className="ht-detail-row"><span className="ht-dl">Type</span><span className="ht-dv">{selectedCardEntry.operationType.charAt(0).toUpperCase() + selectedCardEntry.operationType.slice(1)}</span></div>

        {selectedCardEntry.operationType === 'swap' && (
          <>
            <div className="ht-detail-row"><span className="ht-dl">From</span><span className="ht-dv">{selectedCardEntry.fromAmount.toFixed(6) + ' ' + selectedCardEntry.fromAsset}</span></div>
            <div className="ht-detail-row"><span className="ht-dl">To</span><span className="ht-dv">{selectedCardEntry.toAmount.toFixed(6) + ' ' + selectedCardEntry.toAsset}</span></div>
          </>
        )}

        {selectedCardEntry.operationType === 'buy' && (
          <>
            <div className="ht-detail-row"><span className="ht-dl">Spent</span><span className="ht-dv">{'$' + selectedCardEntry.fromAmount.toFixed(2)}</span></div>
            <div className="ht-detail-row"><span className="ht-dl">Received</span><span className="ht-dv">{selectedCardEntry.toAmount.toFixed(6) + ' ' + selectedCardEntry.toAsset}</span></div>
          </>
        )}

        {selectedCardEntry.operationType === 'sell' && (
          <>
            <div className="ht-detail-row"><span className="ht-dl">Sold</span><span className="ht-dv">{selectedCardEntry.fromAmount.toFixed(6) + ' ' + selectedCardEntry.fromAsset}</span></div>
            <div className="ht-detail-row"><span className="ht-dl">Received</span><span className="ht-dv">{'$' + selectedCardEntry.toAmount.toFixed(2)}</span></div>
          </>
        )}

        <div className="ht-detail-row"><span className="ht-dl">Price</span><span className="ht-dv">{'$' + selectedCardEntry.price.toLocaleString('en-US')}</span></div>
      {selectedCardEntry.xpAwarded > 0 && (
  <div className="ht-detail-row"><span className="ht-dl">Battle Pass XP</span><span className="ht-dv" style={{color:'var(--xlavelia)'}}>{'+' + selectedCardEntry.xpAwarded}</span></div>
)}
      </div>

      <div className="ht-detail-divider"></div>

      <div className="ht-detail-dates">
        <div className="ht-detail-row"><span className="ht-dl">Executed</span><span className="ht-dv ht-dv-date">{formatDate(selectedCardEntry.createdAt)}</span></div>
      </div>
    </div>
  </div>
)}

      <div className="history-screen">
        <div className="history-header"><h1>History</h1></div>

        <div className="history-tabs">
          <button className={'history-tab ' + (activeTab === 'transfers' ? 'active-tab' : '')} onClick={() => setActiveTab('transfers')}>
            <span style={{fontFamily: "Unbounded"}}>Transfers</span>
          </button>
          <button className={'history-tab ' + (activeTab === 'card' ? 'active-tab' : '')} onClick={() => setActiveTab('card')}>
            <span style={{fontFamily: "Unbounded"}}>Card</span>
          </button>
          <button className={'history-tab ht-tab-with-badge ' + (activeTab === 'active' ? 'active-tab' : '')} onClick={() => setActiveTab('active')}>
            <span style={{fontFamily: "Unbounded"}}>Active Trade</span>
          </button>
          <button className={'history-tab ' + (activeTab === 'completed' ? 'active-tab' : '')} onClick={() => setActiveTab('completed')}>
            <span style={{fontFamily: "Unbounded"}}>Completed Trade</span>
          </button>
        </div>

        <div className="history-content">

          {activeTab === 'transfers' && (
            <div className="tf-list">
              {transfers.length === 0 && (
                <div className="ht-empty">
                  <span className="ht-empty-text">No recent transfers</span>
                </div>
              )}
              {transfers.map(function(item, idx) {
                var isSend  = item.direction === 'send';
                var amtStr  = (isSend ? '-' : '+') + '$' + safeNum(item.amount).toFixed(2);
                var dateStr = formatShortDate(item.createdAt);
                var rowClass = 'tf-row ' + (isSend ? 'send' : 'receive');
                var iconClass = 'tf-icon-wrap ' + (isSend ? 'send' : 'receive');
                var amtClass = 'tf-amount ' + (isSend ? 'send' : 'receive');
                var delayStyle = { animationDelay: (idx * 0.03) + 's' };
                return (
                  <div key={item.id} className={rowClass} style={delayStyle} onClick={() => handleOpenTransfer(item.id)}>
                    <div className="tf-row-glow"></div>
                    <div className={iconClass}>
                      {isSend ? <SendIcon /> : <ReceiveIcon />}
                    </div>
                    <div className="tf-info">
                      <span className="tf-name">{(isSend ? 'To ' : 'From ') + item.counterparty}</span>
                      <span className="tf-date">{dateStr}</span>
                    </div>
                    <div className="tf-right">
                      <span className={amtClass}>{amtStr}</span>
                      <span className="tf-currency">USDT</span>
                    </div>
                    <div className="tf-chevron">›</div>
                  </div>
                );
              })}
            </div>
          )}

    {activeTab === 'card' && cardHistory.length === 0 && (
  <div className="ht-empty">
    <span className="ht-empty-text">No card activity yet.</span>
  </div>
)}

{activeTab === 'card' && cardHistory.length > 0 && (
  <div className="tf-list">
    {cardHistory.map(function(item, idx) {
      var isPositive = item.operationType !== 'sell' ? true : true; // все "to" всегда прирост актива, визуально зелёный
      var rowClass = 'tf-row ' + (item.operationType === 'sell' ? 'receive' : (item.operationType === 'swap' ? 'receive' : 'receive'));
      var iconClass = 'tf-icon-wrap';
      var amtClass = 'tf-amount receive';
      var dateStr = formatShortDate(item.createdAt);
      var delayStyle = { animationDelay: (idx * 0.03) + 's' };
      return (
        <div key={item.id} className={rowClass} style={delayStyle} onClick={() => setSelectedCardEntry(item)}>
          <div className="tf-row-glow"></div>
          {/* <div className={iconClass}>
            <span className="tf-coin-glyph">{coinGlyph(item.operationType === 'buy' ? item.toAsset : item.fromAsset)}</span>
          </div> */}
  
<div className="tf-info">
  <span className="tf-name">{cardEntryLabel(item)}</span>
  <span className="tf-date">
    {dateStr}
    {item.xpAwarded > 0 && <span className="xp-inline-badge" style={{marginLeft:'6px'}}>{'+' + item.xpAwarded + ' XP'}</span>}
  </span>
</div>

          <div className="tf-right">
            <span className={amtClass}>{cardEntryAmountStr(item)}</span>
            <span className="tf-currency">{item.operationType.toUpperCase()}</span>
          </div>
          <div className="tf-chevron">›</div>
        </div>
      );
    })}
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
                        <div className="ht-ac-glow"></div>
                        <div className="ht-ac-left">
                          <div className="ht-ac-header">
                            <span className={card.typeClass}>{card.type.toUpperCase()}</span>
                            <span className="ht-lev-tag">{card.leverage + 'x'}</span>
                            {card.feesPaidByVoucher && <span className="ht-voucher-badge">voucher</span>}
                            {card.autoClose && <span className="ht-ac-tp-badge">TP</span>}
                          </div>
                          <div className="ht-ac-coin">{card.coin}</div>
                          <div className="ht-ac-entry">{card.livePriceStr}</div>
                          <div className="ht-ac-liq">{'Liq ' + card.liqStr}</div>
                        </div>
                        <div className="ht-ac-right">
                          <div className={'ht-ac-pnl ' + card.pnlClass}>{card.pnlStr}</div>
                          <div className={'ht-ac-pct ' + card.pnlClass}>{card.pnlPctStr}</div>
                          <div className="ht-ac-live-price">{card.livePriceStr}</div>
                          <div className="ht-ac-tap"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'completed' && closedPositions.length === 0 && (
            <div className="ht-empty">
              <span className="ht-empty-text">No closed trades yet.</span>
            </div>
          )}

          {activeTab === 'completed' && closedPositions.length > 0 && (
            <div className="home-history-wrapper-parent">
              <div className="home-history-wrapper">
                <div className="home-history-list">
                  {closedPositions.map(function(item) {
                    var pnl        = safeNum(item.pnl);
                    var pnlPercent = safeNum(item.pnlPercent);
                    var sign       = pnl >= 0 ? '+' : '';
                    var pnlDisplay = sign + '$' + pnl.toFixed(2);
                    var pctDisplay = sign + pnlPercent.toFixed(2) + '%';
                    var dateStr    = formatDate(item.closedAt);
                    return (
                      <div key={item.id} className="home-history-item ht-trade-row" onClick={() => setSelectedCompletedTrade(item)}>
                        <div className="home-history-left">
                          <div className="home-history-info">
                            <div className="ht-active-top">
                              <h4 className="home-history-name-active">{item.coin}</h4>
                              <span className={'et-pos-badge ' + item.type}>{item.type.toUpperCase()}</span>
                              {item.feesPaidByVoucher && <span className="ht-voucher-badge">voucher</span>}
                            </div>
                           <span className="home-history-date-active">
  <span style={{color:"rgba(255,255,255,0.4)"}}>{dateStr}</span>
  {item.xpAwarded > 0 && <span className="xp-inline-badge" style={{marginLeft:'6px'}}>{'+' + item.xpAwarded + ' XP'}</span>}
</span>
                            </div>
                        </div>
                        <div className="home-history-right">
                          <h4 className="home-history-amount-active">{pnlDisplay}</h4>
                          <span className="home-history-bonus-active">{pctDisplay}</span>
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