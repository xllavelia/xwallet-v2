import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useBalance, usePositions, useTradeHistory, closePositionById } from './useBalance';

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

const Trade = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const chartContainerRef = useRef(null);
  const candleSeriesRef   = useRef(null);
  const priceLineRefs     = useRef([]);

  const currentCoin = location.state && location.state.coin ? location.state.coin : 'BTC';
  const symbol      = currentCoin + 'USDT';

  const [timeframe,    setTimeframe]    = useState('15m');
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceChange,  setPriceChange]  = useState('0.00%');
  const [isPositive,   setIsPositive]   = useState(true);
  const [isMoreOpen,   setIsMoreOpen]   = useState(false);
  const [activePosId,  setActivePosId]  = useState(null);

  const balance      = useBalance();
  const rawPositions = usePositions();
  const tradeHistory = useTradeHistory();

  const positions = rawPositions.map(migratePos);

  const coinStats = {
    BTC: { lev: '125x', vol: '$2.21B', oi: '$1.80B', fund: '0.0000%' },
    ETH: { lev: '100x', vol: '$1.02B', oi: '$1.19B', fund: '0.0012%' },
    SOL: { lev: '50x',  vol: '$850M',  oi: '$420M',  fund: '-0.0020%' },
    TON: { lev: '20x',  vol: '$120M',  oi: '$65M',   fund: '0.0050%' }
  };
  const stats = coinStats[currentCoin] || coinStats['BTC'];

  var numericPrice   = safeNum(currentPrice.toString().replace(/,/g, ''));
  var coinPositions  = positions.filter(function(p) { return p.coin === currentCoin; });
  var balanceStr     = '$' + safeNum(balance).toFixed(2);
  var totalOpenCount = coinPositions.length;

  function calcPnl(pos) {
    if (numericPrice <= 0 || pos.entryPrice <= 0 || pos.margin <= 0) return 0;
    var priceMove = numericPrice - pos.entryPrice;
    var direction = pos.type === 'long' ? 1 : -1;
    return pos.margin * pos.leverage * (priceMove / pos.entryPrice) * direction;
  }

  var positionPanels = coinPositions.map(function(pos) {
    var pnl    = calcPnl(pos);
    var pnlPct = pos.margin > 0 ? (pnl / pos.margin) * 100 : 0;
    var sign   = pnl >= 0 ? '+' : '';
    var dMs    = Date.now() - pos.openTime;
    var dH     = Math.floor(dMs / 3600000);
    var dM     = Math.floor((dMs % 3600000) / 60000);
    var durStr = dH > 0 ? dH + 'h ' + dM + 'm' : dM + 'm';
    return {
      id:                pos.id,
      tradeId:           pos.tradeId,
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
      pnl:               pnl,
      pnlPct:            pnlPct,
      pnlStr:            sign + '$' + pnl.toFixed(2),
      pnlPctStr:         sign + pnlPct.toFixed(2) + '%',
      pnlClass:          pnl >= 0 ? 'et-pnl-pos' : 'et-pnl-neg',
      typeClass:         'et-pos-badge ' + pos.type,
      entryStr:          '$' + pos.entryPrice.toLocaleString('en-US'),
      liqStr:            '$' + Math.round(pos.liqPrice).toLocaleString('en-US'),
      marginStr:         '$' + pos.margin.toFixed(2),
      durationStr:       durStr
    };
  });

  var activePanel = null;
  for (var k = 0; k < positionPanels.length; k++) {
    if (positionPanels[k].id === activePosId) { activePanel = positionPanels[k]; break; }
  }

  var lastTrade     = null;
  for (var i = 0; i < tradeHistory.length; i++) {
    if (tradeHistory[i].coin === currentCoin) { lastTrade = tradeHistory[i]; break; }
  }
  var lastPnl       = lastTrade ? safeNum(lastTrade.pnl) : 0;
  var lastPct       = lastTrade ? safeNum(lastTrade.pnlPercent) : 0;
  var lastSign      = lastPnl >= 0 ? '+' : '';
  var lastPnlStr    = lastTrade ? lastSign + '$' + lastPnl.toFixed(2) : '';
  var lastPctStr    = lastTrade ? lastSign + lastPct.toFixed(2) + '%' : '';
  var lastPnlClass  = lastTrade ? (lastPnl >= 0 ? 'et-last-trade-pnl pos' : 'et-last-trade-pnl neg') : '';
  var lastTypeClass = lastTrade ? ('et-pos-badge ' + (lastTrade.type || 'long')) : '';
  var lastCloseTime = lastTrade ? safeNum(lastTrade.closeTime) : 0;
  var lastDateStr   = lastCloseTime > 0
    ? new Date(lastCloseTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  var modalPnlClass  = activePanel ? (activePanel.pnl >= 0 ? 'et-modal-pnl pos' : 'et-modal-pnl neg') : '';
  var modalTypeClass = activePanel ? ('et-pos-badge ' + activePanel.type) : '';
  var modalAcStr     = activePanel && activePanel.autoClose && activePanel.autoCloseTarget
    ? 'TP +' + activePanel.autoCloseTarget + '%' : 'Off';

  function handleClose(posId) {
    if (numericPrice <= 0) return;
    closePositionById(posId, numericPrice);
    setActivePosId(null);
  }
  function roadHome()          { navigate("/"); }
  function handleTimeframe(tf) { setTimeframe(tf); }

  useEffect(function() {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout:    { background: { type: 'solid', color: '#0a0a0f' }, textColor: '#666' },
      grid:      { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
      crosshair: { mode: 1, vertLine: { color: '#333', labelBackgroundColor: '#161620' }, horzLine: { color: '#333', labelBackgroundColor: '#161620' } },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)', autoScale: true },
      timeScale:       { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true, secondsVisible: false },
      autoSize: true
    });
    const cs = chart.addSeries(CandlestickSeries, {
      upColor: '#00d4aa', downColor: '#ff4466', borderVisible: false, wickUpColor: '#00d4aa', wickDownColor: '#ff4466'
    });
    const vs = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' }, priceScaleId: '', scaleMargins: { top: 0.82, bottom: 0 }
    });
    candleSeriesRef.current = cs;
    const fetchData = async () => {
      try {
        const res  = await fetch('https://api.binance.com/api/v3/klines?symbol=' + symbol + '&interval=' + timeframe + '&limit=150');
        const data = await res.json();
        const candles = []; const volumes = [];
        data.forEach(function(d) {
          var t = d[0]/1000, o = parseFloat(d[1]), h = parseFloat(d[2]), l = parseFloat(d[3]), c = parseFloat(d[4]), v = parseFloat(d[5]);
          candles.push({ time:t, open:o, high:h, low:l, close:c });
          volumes.push({ time:t, value:v, color: c >= o ? 'rgba(0,212,170,0.4)' : 'rgba(255,68,102,0.4)' });
        });
        cs.setData(candles); vs.setData(volumes);
        if (candles.length > 0) {
          var last = candles[candles.length-1], first = candles[0];
          setCurrentPrice(last.close.toLocaleString('en-US'));
          var ch = ((last.close - first.open) / first.open) * 100;
          setPriceChange((ch > 0 ? '+' : '') + ch.toFixed(2) + '%');
          setIsPositive(ch >= 0);
        }
      } catch(err) { console.error(err); }
    };
    fetchData();
    var iv = setInterval(fetchData, 30000);
    return function() { clearInterval(iv); chart.remove(); candleSeriesRef.current = null; priceLineRefs.current = []; };
  }, [symbol, timeframe, currentCoin]);

  useEffect(function() {
    var series = candleSeriesRef.current;
    if (!series) return;
    priceLineRefs.current.forEach(function(line) { try { series.removePriceLine(line); } catch(e) {} });
    priceLineRefs.current = [];
    var filtered = positions.filter(function(p) { return p.coin === currentCoin; });
    filtered.forEach(function(pos, idx) {
      if (pos.entryPrice <= 0 || pos.liqPrice <= 0) return;
      var n  = filtered.length > 1 ? ' #' + (idx+1) : '';
      var el = series.createPriceLine({ price: pos.entryPrice, color: '#f0b90b', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Entry' + n });
      var ll = series.createPriceLine({ price: pos.liqPrice,   color: '#ff4466', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Liq.' + n });
      priceLineRefs.current.push(el, ll);
    });
  }, [positions, currentCoin]);

  useEffect(function() {
    if (numericPrice <= 0) return;
    positions.filter(function(p) { return p.coin === currentCoin; }).forEach(function(pos) {
      if (pos.liqPrice <= 0) return;
      var shouldLiq = pos.type === 'long' ? numericPrice <= pos.liqPrice : numericPrice >= pos.liqPrice;
      if (shouldLiq) { closePositionById(pos.id, pos.liqPrice); if (activePosId === pos.id) setActivePosId(null); return; }
      if (pos.autoClose && pos.autoCloseTarget && pos.entryPrice > 0) {
        var pnl    = calcPnl(pos);
        var pnlPct = pos.margin > 0 ? (pnl / pos.margin) * 100 : 0;
        if (pnlPct >= pos.autoCloseTarget) { closePositionById(pos.id, numericPrice); if (activePosId === pos.id) setActivePosId(null); }
      }
    });
  }, [numericPrice]);

  return (
    <div className="TradeContent">
      <div className="Road-Home" onClick={roadHome}></div>

      {activePanel && (
        <div className="et-pos-modal-overlay" onClick={() => setActivePosId(null)}>
          <div className="et-pos-modal" onClick={function(e) { e.stopPropagation(); }}>
            <div className="et-pos-modal-handle"></div>
            <div className="et-pos-modal-top">
              <span className={modalTypeClass}>{activePanel.type.toUpperCase()}</span>
              <span className="et-pos-modal-coin">{activePanel.coin}</span>
              <span className="et-pos-modal-lev">{activePanel.leverage + 'x'}</span>
              <span className="et-pos-modal-live">LIVE</span>
              <button className="et-pos-modal-x" onClick={() => setActivePosId(null)}>✕</button>
            </div>
            <div className={modalPnlClass}>
              <span className="et-modal-pnl-val">{activePanel.pnlStr}</span>
              <span className="et-modal-pnl-pct">{activePanel.pnlPctStr}</span>
            </div>
            <div className="et-pos-modal-divider"></div>
            <div className="et-pos-modal-grid">
              <div className="et-pos-modal-row"><span className="et-pml">Entry Price</span><span className="et-pmv">{activePanel.entryStr}</span></div>
              <div className="et-pos-modal-row"><span className="et-pml">Current Price</span><span className="et-pmv">{'$' + currentPrice}</span></div>
              <div className="et-pos-modal-row"><span className="et-pml">Liq. Price</span><span className="et-pmv et-pmv-liq">{activePanel.liqStr}</span></div>
              <div className="et-pos-modal-row"><span className="et-pml">Margin</span><span className="et-pmv">{activePanel.marginStr}</span></div>
              <div className="et-pos-modal-row"><span className="et-pml">Position Size</span><span className="et-pmv">{'$' + activePanel.amount.toFixed(2)}</span></div>
              <div className="et-pos-modal-row"><span className="et-pml">Fees</span><span className="et-pmv">{activePanel.feesPaidByVoucher ? 'Voucher' : '$' + activePanel.fees.toFixed(2)}</span></div>
              <div className="et-pos-modal-row"><span className="et-pml">Auto Close</span><span className="et-pmv et-pmv-ac">{modalAcStr}</span></div>
              <div className="et-pos-modal-row"><span className="et-pml">Duration</span><span className="et-pmv">{activePanel.durationStr}</span></div>
              {activePanel.tradeId && (
                <div className="et-pos-modal-row"><span className="et-pml">Trade ID</span><span className="et-pmv et-pmv-id">{activePanel.tradeId}</span></div>
              )}
            </div>
            <div className="et-pos-modal-divider"></div>
            <div className="et-pos-modal-actions">
              <button className="et-pma-dup" onClick={() => { navigate('/order', { state: { coin: activePanel.coin, type: activePanel.type, price: currentPrice, change: priceChange, leverage: activePanel.leverage, amount: activePanel.amount } }); setActivePosId(null); }}>
                Duplicate
              </button>
              <button className="et-pma-close" onClick={() => handleClose(activePanel.id)}>
                Close Position
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="elite-trade">
        <div className="et-header">
          <div className="et-title-box">
            <h1 className="et-symbol">{currentCoin + '-USD'} <span className="et-lev">{stats.lev}</span></h1>
          </div>
          <div className="et-balance-chip">
            <span className="et-balance-label">Balance</span>
            <span className="et-balance-val">{balanceStr}</span>
          </div>
        </div>

        <div className="et-price-zone">
          <div className="et-price">{'$' + currentPrice}</div>
          <div className={'et-change ' + (isPositive ? 'green' : 'red')}>{priceChange}</div>
        </div>

        <div className="et-chart-wrapper" ref={chartContainerRef}></div>

        <div className="et-timeframes">
          <button className={'et-tf-btn ' + (timeframe === '1m'  ? 'active' : '')} onClick={() => handleTimeframe('1m')}>1m</button>
          <button className={'et-tf-btn ' + (timeframe === '3m'  ? 'active' : '')} onClick={() => handleTimeframe('3m')}>3m</button>
          <button className={'et-tf-btn ' + (timeframe === '5m'  ? 'active' : '')} onClick={() => handleTimeframe('5m')}>5m</button>
          <button className={'et-tf-btn ' + (timeframe === '15m' ? 'active' : '')} onClick={() => handleTimeframe('15m')}>15m</button>
          <div className="et-more-container">
            <button className={'et-tf-btn ' + (['1d','1w','1M'].includes(timeframe) ? 'active' : '')} onClick={() => setIsMoreOpen(!isMoreOpen)}>More</button>
            {isMoreOpen && (
              <div className="et-more-dropdown">
                <div className="et-dropdown-item" onClick={() => { handleTimeframe('1d'); setIsMoreOpen(false); }}>1 Day</div>
                <div className="et-dropdown-item" onClick={() => { handleTimeframe('1w'); setIsMoreOpen(false); }}>1 Week</div>
                <div className="et-dropdown-item" onClick={() => { handleTimeframe('1M'); setIsMoreOpen(false); }}>1 Month</div>
              </div>
            )}
          </div>
        </div>

        {totalOpenCount > 0 && (
          <div className="et-positions-container">
            <div className="et-positions-title">
              <span>Active Positions</span>
              <span className="et-pos-count">{totalOpenCount}</span>
            </div>
            {positionPanels.map(function(panel) {
              return (
                <div key={panel.id} className="et-position-card" onClick={() => setActivePosId(panel.id)}>
                  <div className="et-pc-glow" style={{background: panel.pnl >= 0 ? 'rgba(0,212,170,0.06)' : 'rgba(255,68,102,0.06)'}}></div>
                  <div className="et-pc-left">
                    <div className="et-pc-top">
                      <span className={panel.typeClass}>{panel.type.toUpperCase()}</span>
                      <span className="et-pos-lev">{panel.leverage + 'x'}</span>
                      {panel.autoClose && <span className="et-pc-tp">TP</span>}
                    </div>
                    <div className="et-pc-entry">{'Entry ' + panel.entryStr}</div>
                    <div className="et-pc-duration">{panel.durationStr + ' open'}</div>
                  </div>
                  <div className="et-pc-right">
                    <div className={panel.pnlClass + ' et-pc-pnl'}>{panel.pnlStr}</div>
                    <div className={'et-pc-pct ' + (panel.pnl >= 0 ? 'pos' : 'neg')}>{panel.pnlPctStr}</div>
                    <div className="et-pc-tap">details ›</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalOpenCount === 0 && lastTrade && (
          <div className="et-last-trade-panel">
            <div className="et-last-trade-header">
              <span className="et-last-trade-title">Last Trade</span>
              <span className="et-last-trade-date">{lastDateStr}</span>
            </div>
            <div className="et-last-trade-body">
              <span className={lastTypeClass}>{(lastTrade.type || 'trade').toUpperCase()}</span>
              <span className="et-last-entry">{'Entry $' + safeNum(lastTrade.entryPrice).toLocaleString('en-US')}</span>
              <div className={lastPnlClass}>
                <span>{lastPnlStr}</span>
                <span className="et-last-pct">{lastPctStr}</span>
              </div>
            </div>
          </div>
        )}

        <div className="et-stats">
          <div className="et-stat-row"><span>Order book</span><span className="arrow">›</span></div>
          <div className="et-stat-row"><span>24h volume</span><span className="val">{stats.vol}</span></div>
          <div className="et-stat-row"><span>Open interest ⓘ</span><span className="val">{stats.oi}</span></div>
          <div className="et-stat-row"><span>Funding rate ⓘ</span><span className="val yellow">{stats.fund + ' (00:03:40)'}</span></div>
        </div>

        <div className="et-bottom-bar">
          <button className="et-btn-trade long"  onClick={() => navigate('/order', { state: { coin: currentCoin, type: 'long',  price: currentPrice, change: priceChange } })}>Long</button>
          <button className="et-btn-trade short" onClick={() => navigate('/order', { state: { coin: currentCoin, type: 'short', price: currentPrice, change: priceChange } })}>Short</button>
        </div>
      </div>
    </div>
  );
};

export default Trade;
