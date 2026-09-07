import React, { useEffect, useRef, useState } from "react";
import { createChart, LineSeries } from "lightweight-charts";
import { fetchStockChart } from "./useStocks";

var TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y"];

function StockChart(props) {
  var symbol = props.symbol;
  var color = props.color || "#f0b90b";
  var containerRef = useRef(null);
  var chartRef = useRef(null);
  var seriesRef = useRef(null);
  var [timeframe, setTimeframe] = useState("1M");

  useEffect(function () {
    if (!containerRef.current) return;
    var chart = createChart(containerRef.current, {
      layout: { background: { type: "solid", color: "transparent" }, textColor: "#666" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false },
      timeScale: { visible: true, borderVisible: false, timeVisible: true },
      crosshair: { vertLine: { color: "#333" }, horzLine: { color: "#333" } },
      handleScroll: false,
      handleScale: false,
      autoSize: true
    });
    var series = chart.addSeries(LineSeries, {
      color: color, lineWidth: 2, priceLineVisible: false, lastValueVisible: false
    });
    chartRef.current = chart;
    seriesRef.current = series;
    return function () { chart.remove(); };
  }, [color]);

  useEffect(function () {
    if (!seriesRef.current) return;
    fetchStockChart(symbol, timeframe).then(function (points) {
      var data = (points || []).map(function (p) { return { time: p.time, value: p.price }; });
      seriesRef.current.setData(data);
      if (chartRef.current) chartRef.current.timeScale().fitContent();
    }).catch(function () {});
  }, [symbol, timeframe]);

  return (
    <div className="stkchart-wrap">
      <div className="stkchart-canvas" ref={containerRef}></div>
      <div className="stkchart-timeframes">
        {TIMEFRAMES.map(function (tf) {
          return <button key={tf} className={"stkchart-tf-btn " + (timeframe === tf ? "active" : "")} onClick={() => setTimeframe(tf)}>{tf}</button>;
        })}
      </div>
    </div>
  );
}

export default StockChart;