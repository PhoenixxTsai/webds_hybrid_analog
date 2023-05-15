import Plot from "react-plotly.js";
import { useTheme } from "@mui/material/styles";
import React, { useState, useEffect } from "react";
import { Stack, TextField, Box, Paper } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

interface IProps {
  inscale: any;
  cap: any;
  effective: any;
  max: any;
  min: any;
  last?: boolean;
  step1?: boolean;
}

const CHART_WIDTH = 500;
const CHART_HEIGHT = 200;
let RailValue = 1000;

export const Chart = (props: IProps) => {
  const iPreX = 0;
  const iPostX = 2;
  const iPreY = 1;
  const iPostY = 3;
  const last = props.last;
  const step1 = props.step1;
  let p = props;
  const [rail, setRailValue] = useState(RailValue);
  const [chartdata, setchartdata] = useState<any>([]);
  const CHART_FONT_SIZE = 12;
  const rows = step1
    ? []
    : [
        createData("Gain denominator", p.inscale),
        createData("Magnitude", p.cap),
        createData("Effective", p.effective)
      ];
  const showTable = step1 ? "0%" : "45%";
  const showChart = step1 ? "80%" : "55%";
  const showRail = step1;

  //Bar Chart
  const ADC_MAX = 65536;
  const ADC_MID = Math.ceil(ADC_MAX / 2);
  const theme = useTheme();
  const barname = ["", "X", "Y", " "];
  const barnameX = last ? barname : ["", "X", ""];
  const barnameY = last ? barname : ["", "Y", ""];
  const padding = 0;

  let minx = last
    ? [padding, p.min[iPreX], p.min[iPostX], padding]
    : [padding, p.min[iPreX], padding];
  let maxx = last
    ? [padding, p.max[iPreX], p.max[iPostX], padding]
    : [padding, p.max[iPreX], padding];
  let miny = last
    ? [padding, p.min[iPreY], p.min[iPostY], padding]
    : [padding, p.min[iPreY], padding];
  let maxy = last
    ? [padding, p.max[iPreY], p.max[iPostY], padding]
    : [padding, p.max[iPreY], padding];
  let gapx = maxx.map(function (item, index) {
    return item - minx[index];
  });
  let gapy = maxy.map(function (item, index) {
    return item - miny[index];
  });
  let r = rail;
  let gap = ADC_MAX - r * 2;
  let preData = {
    x: barnameX,
    y: gapx,
    base: minx,
    showlegend: true,
    name: last ? "Current" : "X",
    type: "bar",
    marker: { color: "rgba(255, 205, 86, 0.5)" }
  };

  let postData = {
    x: barnameY,
    y: gapy,
    base: miny,
    showlegend: true,
    name: last ? "Tuned" : "Y",
    type: "bar",
    marker: {
      color: "rgba(54, 162, 235, 0.4)"
    }
  };
  let LowLimitTrace = {
    fill: "tozeroy",
    fillcolor: "rgba(255, 99, 132, 0.2)",
    line: {
      color: "rgba(255, 99, 132,1)"
    },
    stackgroup: "one",
    showlegend: false,
    name: "Rail min",
    x: barname,
    y: [r, r, r, r],
    type: "scatter",
    mode: "lines"
  };
  let HighLimitTrace = {
    fill: "tonexty",
    fillcolor: "rgba(54, 162, 235, 0)",
    line: {
      color: "rgba(255, 99, 132,1)"
    },
    stackgroup: "one",
    x: barname,
    y: [gap, gap, gap, gap],
    type: "scatter",
    showlegend: false,
    mode: "lines"
  };
  let MaxTrace = {
    fill: "tonexty",
    stackgroup: "one",
    name: "Rail distance",
    fillcolor: "rgba(255, 99, 132, 0.2)",

    x: barname,
    y: [r, r, r, r],
    type: "scatter",
    mode: "none"
  };
  let MidTrace = {
    name: "Mid",
    showlegend: true,
    x: barname,
    y: [ADC_MID, ADC_MID, ADC_MID, ADC_MID],
    mode: "lines",
    line: {
      color: "rgba(75, 192, 192,1)",
      dash: "dot"
    }
  };
  const layout = {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    margin: {
      b: 15,
      t: 20
    },
    title: {
      text: "ADC",
      y: 1
    },
    //showlegend: last,
    automargin: true,

    paper_bgcolor: "rgba(0,0,0,0)",

    font: {
      color: theme.palette.text.primary
    }
  };
  
  useEffect(() => {
    RailValue = rail;
    setchartdata([
      MidTrace,
      LowLimitTrace,
      HighLimitTrace,
      MaxTrace,
      preData,
      postData
    ]);
    
  }, [props.last, props.step1, rail]);
  function createData(name: string, arr: any) {
    let str = "-ds--";
    let sstr = "--";
    let str1 = "0";
    let str2 = "0";
    let str3 = "0";
    let prex = 0;
    let prey = 0;
    let postx = 0;
    let posty = 0;

    if (typeof arr === "undefined") return { name, str, str1, str2, str3 };
    if (last) {
      prex = arr[iPreX];
      prey = arr[iPreY];
      postx = arr[iPostX];
      posty = arr[iPostY];
    } else {
      prex = arr[0];
      prey = arr[1];
    }

    return last
      ? { name, prex, postx, prey, posty }
      : { name, prex, str, prey, sstr };
  }

  function drawChart() {
    const config = { displayModeBar: false };
    return (
      <Stack
        spacing={0}
        direction="column"
        alignItems="center"
        //justifyContent="space-evenly"
        sx={{ width: "100%", height: "100%" }}
      >
        <Stack direction="row" sx={{ width: "100%", height: showTable }}>
          <TableContainer component={Paper}>
            <Table
              sx={{ minfontSize: CHART_FONT_SIZE }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableCell> </TableCell>
                  <TableCell align="center" colSpan={2}>
                    Hybrid X
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    Hybrid Y
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.prex}</TableCell>
                    <TableCell align="right">{row.postx}</TableCell>
                    <TableCell align="right">{row.prey}</TableCell>
                    <TableCell align="right">{row.posty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        <Stack
          direction="row"
          spacing={0}
          alignItems="center"
          justifyContent="center"
          sx={{ width: "100%", height: showChart }}
        >
          <Plot data={chartdata} layout={layout} config={config} />
        </Stack>
        <div style={{ display: showRail ? "block" : "none" }}>
          <Box mt={2}>
            <TextField
              label="Range from ADC rails"
              type="number"
              id="adc"
              defaultValue={rail}
              onChange={(e) => {
                setRailValue(Number(e.target.value));
              }}
            />
          </Box>
        </div>
      </Stack>
    );
  }

  return <>{drawChart()}</>;
};

export { RailValue };
