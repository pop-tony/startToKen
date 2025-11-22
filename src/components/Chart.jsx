import React, { useContext } from "react";
import PropTypes from "prop-types";
import { scaleTime } from "d3-scale";
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { utcDay, utcWeek } from "d3-time";
import { fitWidth } from "react-stockcharts/lib/helper";
import { timeIntervalBarWidth } from "react-stockcharts/lib/utils";
import { AppContent } from "../contex/TokenContext";

function ChartJS({ width, ratio, type = "svg" }) {
  const { MadeData: data } = useContext(AppContent);

  // 1️⃣ Return the Date object
  console.log(data)
  
  const xAccessor = (d) => {
    if(d){
      return new Date(d.date);
    }
  }

  return (
    <ChartCanvas
      height={400}
      ratio={ratio}
      width={width}
      margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
      type={type}
      data={data}
      seriesName="MSFT"
      xAccessor={xAccessor}
      xScale={scaleTime()}
      xExtents={[new Date(2025, 1, 1), new Date(2025, 11, 16)]} // note: month 11 = December
    >
      <Chart id={1} yExtents={(d) => {
        
        return [d.high, d.low]; // 2️⃣ Return the [high, low] array
      }}>
        <XAxis axisAt="bottom" orient="bottom" ticks={10} />
        <YAxis axisAt="left" orient="left" ticks={10}/>
        <CandlestickSeries width={timeIntervalBarWidth(utcDay)} />
      </Chart>
    </ChartCanvas>
  );
}

ChartJS.propTypes = {
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]),
};

export default fitWidth(ChartJS);