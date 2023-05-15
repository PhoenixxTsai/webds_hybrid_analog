import React, { useState } from "react";
import Plot from "react-plotly.js";
import { useTheme } from "@mui/material/styles";

export const ADCChart = () => {
  const theme = useTheme();
  const [chartdata, setchartdata] = useState<any>([]);
  const barname = ["", "X", "Y", " "];
  let trace1 = {
    x: barname,
    y: [0, 20, 14, 0],
    base: [0, 2, 3, 0],
    name: "Current",
    type: "bar",
    marker: { color: "rgba(255, 205, 86, 0.5)" }
  };

  let trace2 = {
    x: barname,
    y: [0, 12, 29, 0],
    name: "Tuned",
    type: "bar",
    marker: {
      color: "rgba(54, 162, 235, 0.4)"
    }
  };
  let trace3 = {
    fill: "tozeroy",
    fillcolor: "rgba(255, 99, 132, 0.2)",
    line: {
      color: "rgba(255, 99, 132,1)"
    },
    stackgroup: "one",
    showlegend: false,
    name: "Rail min",
    x: barname,
    y: [6, 5, 5, 5],
    type: "scatter",
    mode: "lines"
  };
  let trace4 = {
    fill: "tonexty",
    fillcolor: "rgba(54, 162, 235, 0)",
    line: {
      color: "rgba(255, 99, 132,1)"
    },
    stackgroup: "one",
    x: barname,
    y: [19, 20, 20, 20],
    type: "scatter",
    showlegend: false,
    mode: "lines"
  };
  let trace5 = {
    fill: "tonexty",
    stackgroup: "one",
    name: "Rail range",
    fillcolor: "rgba(255, 99, 132, 0.2)",

    x: barname,
    y: [6, 5, 5, 5],
    type: "scatter",
    mode: "none"
  };
  setchartdata([trace3, trace4, trace5, trace1, trace2]);
  const layout = {
    title: "ADC",
    font: {
      color: theme.palette.text.primary
    }
  };

  return <Plot data={chartdata} layout={layout} />;
};
