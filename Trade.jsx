import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

const Trade = () => {
 const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };

 const location = useLocation();
  const chartContainerRef = useRef(null);

  // Получаем монету (по умолчанию BTC)
  const currentCoin = location.state && location.state.coin ? location.state.coin : 'BTC';
  const symbol = currentCoin + 'USDT';

  // Состояния
  const [timeframe, setTimeframe] = useState('15m');
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceChange, setPriceChange] = useState('0.00%');
  const [isPositive, setIsPositive] = useState(true);

  // Статичные данные для визуала (в идеале тоже тянуть с API, но для интерфейса пойдет)
  const coinStats = {
    BTC: { lev: '40x', vol: '$2.21B', oi: '$1.80B', fund: '0.0000%' },
    ETH: { lev: '25x', vol: '$1.02B', oi: '$1.19B', fund: '0.0012%' },
    SOL: { lev: '20x', vol: '$850M', oi: '$420M', fund: '-0.0020%' },
    TON: { lev: '10x', vol: '$120M', oi: '$65M', fund: '0.0050%' }
  };
  const stats = coinStats[currentCoin] || coinStats['BTC'];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Инициализация элитного графика TradingView
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#0d0e12' },
        textColor: '#888888',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1, // Magnet mode
        vertLine: { color: '#555', labelBackgroundColor: '#1a1b20' },
        horzLine: { color: '#555', labelBackgroundColor: '#1a1b20' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        autoScale: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true, // Автоматический ресайз
    });

 const candlestickSeries = chart.addSeries(CandlestickSeries, {
  upColor: '#2ebd85',
  downColor: '#f6465d',
  borderVisible: false,
  wickUpColor: '#2ebd85',
  wickDownColor: '#f6465d',
}); 

   const volumeSeries = chart.addSeries(HistogramSeries, {
  priceFormat: { type: 'volume' },
  priceScaleId: '', 
  scaleMargins: { top: 0.8, bottom: 0 },
});

    // 3. Загрузка реальных данных с Binance REST API
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/klines?symbol=' + symbol + '&interval=' + timeframe + '&limit=150');
        const data = await res.json();

        const candles = [];
        const volumes = [];

        data.forEach(d => {
          const time = d[0] / 1000;
          const open = parseFloat(d[1]);
          const high = parseFloat(d[2]);
          const low = parseFloat(d[3]);
          const close = parseFloat(d[4]);
          const volume = parseFloat(d[5]);
          
          const isGreen = close >= open;

          candles.push({ time, open, high, low, close });
          volumes.push({
            time,
            value: volume,
            color: isGreen ? 'rgba(46, 189, 133, 0.5)' : 'rgba(246, 70, 93, 0.5)'
          });
        });

        candlestickSeries.setData(candles);
        volumeSeries.setData(volumes);

        // Обновляем текущую цену и процент (берем из последней закрытой/текущей свечи)
        if (candles.length > 0) {
          const lastCandle = candles[candles.length - 1];
const firstCandle = candles[0];
          setCurrentPrice(lastCandle.close.toLocaleString('en-US'));
          
          const change = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;
          setPriceChange((change > 0 ? '+' : '') + change.toFixed(2) + '%');
          setIsPositive(change >= 0);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();

    return () => {
      chart.remove();
    };
  }, [symbol, timeframe, currentCoin]);

  const handleTimeframe = (tf) => setTimeframe(tf);

const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (<div className="TradeContent">
<div className="Road-Home" onClick={roadHome}></div>

<div className="elite-trade">
      
      {/* HEADER */}
      <div className="et-header">
        <div className="et-title-box">
       
          <h1 className="et-symbol">{currentCoin + '-USD'} <span className="et-lev">{stats.lev}</span></h1>
        </div>

      </div>

      {/* PRICE ZONE */}
      <div className="et-price-zone">
        <div className="et-price">{'$' + currentPrice}</div>
        <div className={'et-change ' + (isPositive ? 'green' : 'red')}>
          {priceChange}
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="et-chart-wrapper" ref={chartContainerRef}></div>

     {/* TIMEFRAMES */}
<div className="et-timeframes">
  <button className={'et-tf-btn ' + (timeframe === '1m' ? 'active' : '')} onClick={() => handleTimeframe('1m')}>1min</button>
  <button className={'et-tf-btn ' + (timeframe === '3m' ? 'active' : '')} onClick={() => handleTimeframe('3m')}>3min</button>
  <button className={'et-tf-btn ' + (timeframe === '5m' ? 'active' : '')} onClick={() => handleTimeframe('5m')}>5min</button>
  <button className={'et-tf-btn ' + (timeframe === '15m' ? 'active' : '')} onClick={() => handleTimeframe('15m')}>15min</button>
  
  {/* Элитный Dropdown More */}
  <div className="et-more-container">
    <button 
      className={'et-tf-btn ' + (['1d', '1w', '1M'].includes(timeframe) ? 'active' : '')} 
      onClick={() => setIsMoreOpen(!isMoreOpen)}
    >
      More
    </button>
    
    {isMoreOpen && (
      <div className="et-more-dropdown">
        <div className="et-dropdown-item" onClick={() => { handleTimeframe('1d'); setIsMoreOpen(false); }}>1 Day</div>
        <div className="et-dropdown-item" onClick={() => { handleTimeframe('1w'); setIsMoreOpen(false); }}>7 Days</div>
        <div className="et-dropdown-item" onClick={() => { handleTimeframe('1M'); setIsMoreOpen(false); }}>1 Month</div>
      </div>
    )}
  </div>
</div>

      {/* STATS */}
      <div className="et-stats">
        {/* <h2>Stats</h2> */}
        <div className="et-stat-row">
          <span>Order book</span>
          <span className="arrow">›</span>
        </div>
        <div className="et-stat-row">
          <span>24h volume</span>
          <span className="val">{stats.vol}</span>
        </div>
        <div className="et-stat-row">
          <span>Open interest ⓘ</span>
          <span className="val">{stats.oi}</span>
        </div>
        <div className="et-stat-row">
          <span>Funding rate ⓘ</span>
          <span className="val yellow">{stats.fund + ' (00:03:40)'}</span>
        </div>
      </div>

      {/* BOTTOM BUTTONS */}
      <div className="et-bottom-bar">
        <button className="et-btn-trade long">Long</button>
        <button className="et-btn-trade short">Short</button>
      </div>
    </div>

</div>);
};

export default Trade;