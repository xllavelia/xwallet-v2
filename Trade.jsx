import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useBalance, usePositions, useTradeHistory, closePositionById } from './useBalance';

const Trade = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const chartContainerRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const priceLineRefs = useRef([]);

  const currentCoin = location.state && location.state.coin ? location.state.coin : 'BTC';
  const symbol = currentCoin + 'USDT';

  const [timeframe, setTimeframe] = useState('15m');
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceChange, setPriceChange] = useState('0.00%');
  const [isPositive, setIsPositive] = useState(true);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const balance = useBalance();
  const positions = usePositions();
  const tradeHistory = useTradeHistory();

  const coinStats = {
    BTC: { lev: '125x', vol: '$2.21B', oi: '$1.80B', fund: '0.0000%' },
    ETH: { lev: '100x', vol: '$1.02B', oi: '$1.19B', fund: '0.0012%' },
    SOL: { lev: '50x',  vol: '$850M',  oi: '$420M',  fund: '-0.0020%' },
    TON: { lev: '20x',  vol: '$120M',  oi: '$65M',   fund: '0.0050%' }
  };
  const stats = coinStats[currentCoin] || coinStats['BTC'];

  var numericPrice = parseFloat(currentPrice.toString().replace(/,/g, '')) || 0;
  var coinPositions = positions.filter(function(p) { return p.coin === currentCoin; });
  var balanceStr = '$' + balance.toFixed(2);
  var totalOpenCount = coinPositions.length;

  var positionPanels = coinPositions.map(function(pos) {
    var priceMove = numericPrice - pos.entryPrice;
    var direction = pos.type === 'long' ? 1 : -1;
    var pnl = numericPrice > 0 && pos.entryPrice > 0
      ? pos.margin * pos.leverage * (priceMove / pos.entryPrice) * direction
      : 0;
    var pnlPct = pos.margin > 0 ? (pnl / pos.margin) * 100 : 0;
    var sign = pnl >= 0 ? '+' : '';
    return {
      id: pos.id,
      type: pos.type,
      leverage: pos.leverage,
      pnlStr: sign + '$' + pnl.toFixed(2),
      pnlPctStr: sign + pnlPct.toFixed(2) + '%',
      pnlClass: pnl >= 0 ? 'et-pnl-pos' : 'et-pnl-neg',
      typeClass: 'et-pos-badge ' + pos.type,
      entryStr: '$' + pos.entryPrice.toLocaleString('en-US'),
      liqStr: '$' + Math.round(pos.liqPrice).toLocaleString('en-US'),
      marginStr: '$' + pos.margin.toFixed(2)
    };
  });

  var lastTrade = null;
  for (var i = 0; i < tradeHistory.length; i++) {
    if (tradeHistory[i].coin === currentCoin) { lastTrade = tradeHistory[i]; break; }
  }

  var lastSign = lastTrade && lastTrade.pnl >= 0 ? '+' : '';
  var lastPnlStr = lastTrade ? lastSign + '$' + lastTrade.pnl.toFixed(2) : '';
  var lastPctStr = lastTrade ? lastSign + lastTrade.pnlPercent.toFixed(2) + '%' : '';
  var lastPnlClass = lastTrade ? (lastTrade.pnl >= 0 ? 'et-last-trade-pnl pos' : 'et-last-trade-pnl neg') : '';
  var lastTypeClass = lastTrade ? ('et-pos-badge ' + lastTrade.type) : '';
  var lastDateStr = lastTrade ? new Date(lastTrade.closeTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  function handleClose(posId) {
    if (numericPrice <= 0) return;
    closePositionById(posId, numericPrice);
  }
  function roadHome() { navigate("/"); }
  function handleTimeframe(tf) { setTimeframe(tf); }

  useEffect(function() {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: 'solid', color: '#0d0e12' }, textColor: '#888' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } },
      crosshair: { mode: 1, vertLine: { color: '#444', labelBackgroundColor: '#1a1b20' }, horzLine: { color: '#444', labelBackgroundColor: '#1a1b20' } },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)', autoScale: true },
      timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true, secondsVisible: false },
      autoSize: true
    });
    const cs = chart.addSeries(CandlestickSeries, {
      upColor: '#2ebd85', downColor: '#f6465d', borderVisible: false, wickUpColor: '#2ebd85', wickDownColor: '#f6465d'
    });
    const vs = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' }, priceScaleId: '', scaleMargins: { top: 0.8, bottom: 0 }
    });
    candleSeriesRef.current = cs;
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/klines?symbol=' + symbol + '&interval=' + timeframe + '&limit=150');
        const data = await res.json();
        const candles = [];
        const volumes = [];
        data.forEach(function(d) {
          var t = d[0] / 1000;
          var o = parseFloat(d[1]);
          var h = parseFloat(d[2]);
          var l = parseFloat(d[3]);
          var c = parseFloat(d[4]);
          var v = parseFloat(d[5]);
          candles.push({ time: t, open: o, high: h, low: l, close: c });
          volumes.push({ time: t, value: v, color: c >= o ? 'rgba(46,189,133,0.5)' : 'rgba(246,70,93,0.5)' });
        });
        cs.setData(candles);
        vs.setData(volumes);
        if (candles.length > 0) {
          var last = candles[candles.length - 1];
          var first = candles[0];
          setCurrentPrice(last.close.toLocaleString('en-US'));
          var ch = ((last.close - first.open) / first.open) * 100;
          setPriceChange((ch > 0 ? '+' : '') + ch.toFixed(2) + '%');
          setIsPositive(ch >= 0);
        }
      } catch(err) { console.error(err); }
    };
    fetchData();
    return function() { chart.remove(); candleSeriesRef.current = null; priceLineRefs.current = []; };
  }, [symbol, timeframe, currentCoin]);

  useEffect(function() {
    var series = candleSeriesRef.current;
    if (!series) return;
    priceLineRefs.current.forEach(function(line) {
      try { series.removePriceLine(line); } catch(e) {}
    });
    priceLineRefs.current = [];
    var filtered = positions.filter(function(p) { return p.coin === currentCoin; });
    filtered.forEach(function(pos, idx) {
      var n = filtered.length > 1 ? ' #' + (idx + 1) : '';
      var el = series.createPriceLine({ price: pos.entryPrice, color: '#f0b90b', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Entry' + n });
      var ll = series.createPriceLine({ price: pos.liqPrice,   color: '#f6465d', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Liq.' + n });
      priceLineRefs.current.push(el, ll);
    });
  }, [positions, currentCoin]);

  return (
    <div className="TradeContent">
      <div className="Road-Home" onClick={roadHome}></div>
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
          <button className={'et-tf-btn ' + (timeframe === '1m'  ? 'active' : '')} onClick={() => handleTimeframe('1m')}>1min</button>
          <button className={'et-tf-btn ' + (timeframe === '3m'  ? 'active' : '')} onClick={() => handleTimeframe('3m')}>3min</button>
          <button className={'et-tf-btn ' + (timeframe === '5m'  ? 'active' : '')} onClick={() => handleTimeframe('5m')}>5min</button>
          <button className={'et-tf-btn ' + (timeframe === '15m' ? 'active' : '')} onClick={() => handleTimeframe('15m')}>15min</button>
          <div className="et-more-container">
            <button className={'et-tf-btn ' + (['1d','1w','1M'].includes(timeframe) ? 'active' : '')} onClick={() => setIsMoreOpen(!isMoreOpen)}>More</button>
            {isMoreOpen && (
              <div className="et-more-dropdown">
                <div className="et-dropdown-item" onClick={() => { handleTimeframe('1d'); setIsMoreOpen(false); }}>1 Day</div>
                <div className="et-dropdown-item" onClick={() => { handleTimeframe('1w'); setIsMoreOpen(false); }}>7 Days</div>
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
                <div key={panel.id} className="et-position-panel">
                  <div className="et-position-panel-top">
                    <div className="et-position-left">
                      <span className={panel.typeClass}>{panel.type.toUpperCase()}</span>
                      <span className="et-pos-coin">{currentCoin}</span>
                      <span className="et-pos-lev">{panel.leverage + 'x'}</span>
                    </div>
                    <div className={panel.pnlClass + ' et-pnl-block'}>
                      <span className="et-pnl-val">{panel.pnlStr}</span>
                      <span className="et-pnl-pct">{panel.pnlPctStr}</span>
                    </div>
                  </div>
                  <div className="et-position-panel-rows">
                    <div className="et-pos-row"><span className="et-pos-label">Entry</span><span className="et-pos-val">{panel.entryStr}</span></div>
                    <div className="et-pos-row"><span className="et-pos-label">Liq. Price</span><span className="et-pos-val et-liq-val">{panel.liqStr}</span></div>
                    <div className="et-pos-row"><span className="et-pos-label">Margin</span><span className="et-pos-val">{panel.marginStr}</span></div>
                  </div>
                  <button className="et-close-pos-btn" onClick={() => handleClose(panel.id)}>Close Position</button>
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
              <span className={lastTypeClass}>{lastTrade.type.toUpperCase()}</span>
              <span className="et-last-entry">{'Entry: $' + lastTrade.entryPrice.toLocaleString('en-US')}</span>
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