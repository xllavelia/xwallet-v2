import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useWalletBalance } from './useWallet';
import { usePositionsRemote, closePosition } from './usePositions';
import { useCardFunding } from "./useCardFunding";

function safeNum(val) {
  var n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

const Trade = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const chartContainerRef = useRef(null);
  const candleSeriesRef   = useRef(null);
  const priceLineRefs     = useRef([]);
  const [xpToast, setXpToast] = useState(null);

  const currentCoin = location.state && location.state.coin ? location.state.coin : 'BTC';
  const symbol      = currentCoin + 'USDT';

  const [timeframe,    setTimeframe]    = useState('15m');
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceChange,  setPriceChange]  = useState('0.00%');
  const [isPositive,   setIsPositive]   = useState(true);
  const [isMoreOpen,   setIsMoreOpen]   = useState(false);
  const [activePosId,  setActivePosId]  = useState(null);

const { wallet } = useWalletBalance();
const { activeCard } = useCardFunding();
const balance = activeCard ? activeCard.balance : wallet.balance;
  const { positions, refresh } = usePositionsRemote();

  const coinStats = {
    BTC: { lev: '200x', vol: '$2.21B', oi: '$1.80B', fund: '0.0000%' },
    ETH: { lev: '200x', vol: '$1.02B', oi: '$1.19B', fund: '0.0012%' },
    SOL: { lev: '150x', vol: '$850M',  oi: '$420M',  fund: '-0.0020%' },
    TON: { lev: '75x',  vol: '$120M',  oi: '$65M',   fund: '0.0050%' }
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
    var dMs    = Date.now() - new Date(pos.openedAt).getTime();
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

  var modalPnlClass  = activePanel ? (activePanel.pnl >= 0 ? 'et-modal-pnl pos' : 'et-modal-pnl neg') : '';
  var modalTypeClass = activePanel ? ('et-pos-badge ' + activePanel.type) : '';
  var modalAcStr     = activePanel && activePanel.autoClose && activePanel.autoCloseTarget
    ? 'TP +' + activePanel.autoCloseTarget + '%' : 'Off';

function handleClose(posId) {
  if (numericPrice <= 0) return;
  closePosition(posId, numericPrice).then(function(result) {
    refresh();
    var messages = [];
    if (result && result.xpAwarded > 0) messages.push('+' + result.xpAwarded + ' XP');
    if (result && result.cashbackAwarded > 0) messages.push('+$' + result.cashbackAwarded.toFixed(2) + ' cashback');
    if (messages.length > 0) {
      setXpToast(messages.join(' · '));
      setTimeout(function() { setXpToast(null); }, 2400);
    }
  });
  setActivePosId(null);
}

  function handleTimeframe(tf) { setTimeframe(tf); }

  function navigateLong() {
    navigate(-1);
    setTimeout(function () {
      navigate('/order', { state: { coin: currentCoin, type: 'long', price: currentPrice, change: priceChange } });
    }, 10);
  }
  function navigateShort() {
    navigate(-1);
    setTimeout(function () {
      navigate('/order', { state: { coin: currentCoin, type: 'short', price: currentPrice, change: priceChange } });
    }, 10);
  }

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

  return (
    <div className="TradeContent">

{xpToast && <div className="et-xp-toast">{xpToast}</div>}

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
            <span className="et-balance-label">{activeCard ? (activeCard.tier.charAt(0).toUpperCase() + activeCard.tier.slice(1) + " Card") : "Balance"}</span>
            {/* <span className="et-balance-val">{balanceStr}</span> */}
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
                  <div className="et-pc-glow"></div>
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

        <div className="et-stats">
          <div className="et-stat-row"><span>Order book</span><span className="arrow">›</span></div>
          <div className="et-stat-row"><span>24h volume</span><span className="val">{stats.vol}</span></div>
          <div className="et-stat-row"><span>Open interest ⓘ</span><span className="val">{stats.oi}</span></div>
          <div className="et-stat-row"><span>Funding rate ⓘ</span><span className="val yellow">{stats.fund + ' (00:03:40)'}</span></div>
        </div>

        <div className="et-bottom-bar">
          <button className="et-btn-trade long"  onClick={navigateLong}>Long</button>
          <button className="et-btn-trade short" onClick={navigateShort}>Short</button>
        </div>
      </div>
    </div>
  );
};

export default Trade;