import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useBalance, usePosition, useTradeHistory, writeBalance, writePosition, addClosedTrade } from './useBalance';

const Trade = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const chartContainerRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const entryLineRef = useRef(null);
  const liqLineRef = useRef(null);

  const currentCoin = location.state && location.state.coin ? location.state.coin : 'BTC';
  const symbol = currentCoin + 'USDT';

  const [timeframe, setTimeframe] = useState('15m');
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceChange, setPriceChange] = useState('0.00%');
  const [isPositive, setIsPositive] = useState(true);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const balance = useBalance();
  const position = usePosition();
  const tradeHistory = useTradeHistory();

  const coinStats = {
    BTC: { lev: '40x', vol: '$2.21B', oi: '$1.80B', fund: '0.0000%' },
    ETH: { lev: '25x', vol: '$1.02B', oi: '$1.19B', fund: '0.0012%' },
    SOL: { lev: '20x', vol: '$850M', oi: '$420M', fund: '-0.0020%' },
    TON: { lev: '10x', vol: '$120M', oi: '$65M', fund: '0.0050%' }
  };
  const stats = coinStats[currentCoin] || coinStats['BTC'];

  const numericPrice = parseFloat(currentPrice.toString().replace(/,/g, '')) || 0;
  const positionActive = position !== null && position.coin === currentCoin;

  var pnl = 0;
  if (positionActive && numericPrice > 0 && position.entryPrice > 0) {
    var priceMove = numericPrice - position.entryPrice;
    var direction = position.type === 'long' ? 1 : -1;
    pnl = position.margin * position.leverage * (priceMove / position.entryPrice) * direction;
  }

  var pnlSign = pnl >= 0 ? '+' : '';
  var pnlStr = positionActive ? pnlSign + '$' + pnl.toFixed(2) : '--';
  var pnlPct = positionActive ? (pnl / position.margin) * 100 : 0;
  var pnlPctStr = positionActive ? pnlSign + pnlPct.toFixed(2) + '%' : '';
  var pnlClass = pnl >= 0 ? 'et-pnl-pos' : 'et-pnl-neg';
  var balanceStr = '$' + balance.toFixed(2);
  var posTypeLabel = positionActive ? (position.type === 'long' ? 'LONG' : 'SHORT') : '';
  var posTypeClass = positionActive ? ('et-pos-badge ' + position.type) : 'et-pos-badge';
  var entryStr = positionActive ? '$' + position.entryPrice.toLocaleString('en-US') : '';
  var liqStr = positionActive ? '$' + Math.round(position.liqPrice).toLocaleString('en-US') : '';
  var marginStr = positionActive ? '$' + position.margin.toFixed(2) : '';

  var lastTrade = null;
  for (var i = 0; i < tradeHistory.length; i++) {
    if (tradeHistory[i].coin === currentCoin) { lastTrade = tradeHistory[i]; break; }
  }

  var lastTradeSign = lastTrade && lastTrade.pnl >= 0 ? '+' : '';
  var lastTradePnlStr = lastTrade ? lastTradeSign + '$' + lastTrade.pnl.toFixed(2) : '';
  var lastTradePctStr = lastTrade ? lastTradeSign + lastTrade.pnlPercent.toFixed(2) + '%' : '';
  var lastTradeClass = lastTrade ? (lastTrade.pnl >= 0 ? 'et-last-trade-pnl pos' : 'et-last-trade-pnl neg') : '';
  var lastTradeTypeClass = lastTrade ? ('et-pos-badge ' + lastTrade.type) : '';
  var lastTradeDateStr = lastTrade ? new Date(lastTrade.closeTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  function handleClosePosition() {
    if (!positionActive) return;
    var closePrice = numericPrice;
    var finalBalance = balance + position.margin + pnl;
    if (finalBalance < 0) finalBalance = 0;
    var closedTrade = {
      id: Date.now(),
      coin: position.coin,
      type: position.type,
      entryPrice: position.entryPrice,
      closePrice: closePrice,
      leverage: position.leverage,
      amount: position.amount,
      margin: position.margin,
      fees: position.fees,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercent: parseFloat(pnlPct.toFixed(2)),
      liqPrice: position.liqPrice,
      openTime: position.openTime,
      closeTime: Date.now(),
      duration: Date.now() - position.openTime,
      result: pnl >= 0 ? 'win' : 'loss'
    };
    writeBalance(parseFloat(finalBalance.toFixed(2)));
    writePosition(null);
    addClosedTrade(closedTrade);
  }

  function roadHome() { navigate("/"); }
  function handleTimeframe(tf) { setTimeframe(tf); }

  useEffect(function() {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: 'solid', color: '#0d0e12' }, textColor: '#888888' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.05)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
      crosshair: { mode: 1, vertLine: { color: '#555', labelBackgroundColor: '#1a1b20' }, horzLine: { color: '#555', labelBackgroundColor: '#1a1b20' } },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)', autoScale: true },
      timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true, secondsVisible: false },
      autoSize: true
    });
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#2ebd85', downColor: '#f6465d', borderVisible: false, wickUpColor: '#2ebd85', wickDownColor: '#f6465d'
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' }, priceScaleId: '', scaleMargins: { top: 0.8, bottom: 0 }
    });
    candleSeriesRef.current = candlestickSeries;
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/klines?symbol=' + symbol + '&interval=' + timeframe + '&limit=150');
        const data = await res.json();
        const candles = [];
        const volumes = [];
        data.forEach(function(d) {
          var time = d[0] / 1000;
          var open = parseFloat(d[1]);
          var high = parseFloat(d[2]);
          var low = parseFloat(d[3]);
          var close = parseFloat(d[4]);
          var volume = parseFloat(d[5]);
          candles.push({ time, open, high, low, close });
          volumes.push({ time, value: volume, color: close >= open ? 'rgba(46,189,133,0.5)' : 'rgba(246,70,93,0.5)' });
        });
        candlestickSeries.setData(candles);
        volumeSeries.setData(volumes);
        if (candles.length > 0) {
          var last = candles[candles.length - 1];
          var first = candles[0];
          setCurrentPrice(last.close.toLocaleString('en-US'));
          var change = ((last.close - first.open) / first.open) * 100;
          setPriceChange((change > 0 ? '+' : '') + change.toFixed(2) + '%');
          setIsPositive(change >= 0);
        }
      } catch (err) { console.error('Error fetching data:', err); }
    };
    fetchData();
    return function() { chart.remove(); candleSeriesRef.current = null; };
  }, [symbol, timeframe, currentCoin]);

  useEffect(function() {
    var series = candleSeriesRef.current;
    if (!series) return;
    if (entryLineRef.current) { try { series.removePriceLine(entryLineRef.current); } catch(e){} entryLineRef.current = null; }
    if (liqLineRef.current)   { try { series.removePriceLine(liqLineRef.current);   } catch(e){} liqLineRef.current = null; }
    if (positionActive) {
      entryLineRef.current = series.createPriceLine({ price: position.entryPrice, color: '#f0b90b', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Entry' });
      liqLineRef.current   = series.createPriceLine({ price: position.liqPrice,   color: '#f6465d', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Liq.' });
    }
  }, [positionActive, currentPrice]);

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

        {positionActive && (
          <div className="et-position-panel">
            <div className="et-position-panel-top">
              <div className="et-position-left">
                <span className={posTypeClass}>{posTypeLabel}</span>
                <span className="et-pos-coin">{position.coin}</span>
                <span className="et-pos-lev">{position.leverage + 'x'}</span>
              </div>
              <div className={pnlClass + ' et-pnl-block'}>
                <span className="et-pnl-val">{pnlStr}</span>
                <span className="et-pnl-pct">{pnlPctStr}</span>
              </div>
            </div>
            <div className="et-position-panel-rows">
              <div className="et-pos-row"><span className="et-pos-label">Entry</span><span className="et-pos-val">{entryStr}</span></div>
              <div className="et-pos-row"><span className="et-pos-label">Liq. Price</span><span className="et-pos-val et-liq-val">{liqStr}</span></div>
              <div className="et-pos-row"><span className="et-pos-label">Margin</span><span className="et-pos-val">{marginStr}</span></div>
            </div>
            <button className="et-close-pos-btn" onClick={handleClosePosition}>Close Position</button>
          </div>
        )}

        {!positionActive && lastTrade && (
          <div className="et-last-trade-panel">
            <div className="et-last-trade-header">
              <span className="et-last-trade-title">Last Trade</span>
              <span className="et-last-trade-date">{lastTradeDateStr}</span>
            </div>
            <div className="et-last-trade-body">
              <span className={lastTradeTypeClass}>{lastTrade.type.toUpperCase()}</span>
              <span className="et-last-entry">{'Entry: $' + lastTrade.entryPrice.toLocaleString('en-US')}</span>
              <div className={lastTradeClass}>
                <span>{lastTradePnlStr}</span>
                <span className="et-last-pct">{lastTradePctStr}</span>
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