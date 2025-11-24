import React, { Component } from "react";
import $ from "jquery";
import * as Charting from "@mindfusion/charting";
import * as Drawing from "@mindfusion/drawing";
import * as Collections from "@mindfusion/common-collections";

export class RealTimeChart extends Component {
  constructor(props) {
    super(props);
    this.el = React.createRef();               // canvas reference
    this.chart = null;                         // instance‑level chart ref
    this.state = {
      data: new Collections.List(),           // underlying data collection
      intervalId: null
    };
  }

  // -----------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------
  componentDidMount() {
    // 1️⃣ Create the chart
    const stockChart = new Charting.Controls.CandlestickChart(this.el.current);

    // ---- appearance (unchanged) ----
    stockChart.title = "RFT Prices";
    stockChart.theme.titleFontSize = 16;
    stockChart.theme.titleBrush = new Drawing.Brush("#ffffff");
    stockChart.candlestickWidth = 12;
    stockChart.showLegend = false;
    stockChart.chartPanel.margin = new Charting.Margins(5, 5, 5, 30);

    stockChart.showXCoordinates = false;
    stockChart.xAxisLabelRotationAngle = 30;

    stockChart.xAxis.minValue = 20;
    stockChart.xAxis.interval = 1;
    stockChart.xAxis.maxValue = 30;
    stockChart.xAxis.title = "Time";

    stockChart.yAxis.title = "Price";
    stockChart.yAxis.minValue = 30;
    stockChart.yAxis.interval = 1;
    stockChart.yAxis.maxValue = 40;

    stockChart.gridType = Charting.GridType.None;
    stockChart.plot.seriesStyle = new Charting.CandlestickSeriesStyle(
      new Drawing.Brush("#ff2f26"),
      new Drawing.Brush("#00b140"),
      new Drawing.Brush("#2e2e2a"),
      2,
      Drawing.DashStyle.Solid,
      stockChart.plot.seriesRenderers.item(0)
    );

    stockChart.theme.axisLabelsBrush = stockChart.theme.axisTitleBrush = stockChart.theme.axisStroke =
      new Drawing.Brush("#ffffff");
    stockChart.theme.axisLabelsFontSize = 12;
    stockChart.theme.axisTitleFontSize = 14;
    stockChart.theme.highlightStroke = new Drawing.Brush("#cecece");

    // 2️⃣ Store references
    this.chart = stockChart;
    const intervalId = setInterval(this.updateStock.bind(this), 60000);
    this.setState({ intervalId });

    // 3️⃣ Initial data load (if any)
    if (this.props.mdata) {
      this.updateStock(this.props.mdata);
    }
  }

  componentDidUpdate(prevProps) {
    // Reload when new data arrives after mount
    if (this.props.mdata !== prevProps.mdata && this.props.mdata) {
      this.updateStock(this.props.mdata);
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  // -----------------------------------------------------------------
  // Public API – accept a URL string or an array of OHLCV objects
  // -----------------------------------------------------------------
  updateStock(source) {
	
    if (typeof source === "string") {
		console.log("string")
      $.getJSON(source, json => this._processData(json["Time Series (1min)"]));
    } else if (Array.isArray(source)) {
		console.log("array")
      this._processData(source);
    } else {
      return
    }
  }

  // -----------------------------------------------------------------
  // Convert raw objects to StockPrice items and feed the chart
  // -----------------------------------------------------------------
  _processData(raw) {
    // Guard – chart may not be ready yet (e.g., first call before componentDidMount finishes)
    if (!this.chart) return;

    const data = raw.map(item => {
		
      // Alpha Vantage format
      if (item["1. open"]) {
        return new Charting.StockPrice(
          item["1. open"],
          item["4. close"],
          item["3. low"],
          item["2. high"],
          new Date(item.date)
        );
      }
      // Our own {open, high, low, close, date} format
      return new Charting.StockPrice(
        item.open,
        item.close,
        item.low,
        item.high,
        item.date
      );
    });

    const isFirstLoad = this.chart.series.count() === 0;

    if (isFirstLoad) {
      data.reverse().forEach(pt => this.state.data.insert(0, pt));
    } else {
      data.forEach(pt => {
        this.state.data.add(pt);
        //this.state.data.removeAt(0);
      });
    }

    const series = new Charting.StockPriceSeries(this.state.data);
    series.dateTimeFormat = Charting.DateTimeFormat.ShortTime;

    const coll = new Collections.ObservableCollection();
    coll.add(series);

    this.chart.series = coll;
    this.chart.draw();
  }

  // -----------------------------------------------------------------
  render() {
    return (
      <div>
        <canvas width="800px" height="400px" ref={this.el} />
      </div>
    );
  }
}