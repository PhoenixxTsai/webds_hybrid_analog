import React, { useEffect, useRef } from "react";

import { Stack, Button, Typography } from "@mui/material";

import { SendGetADC } from "./tutor_api";
import { Chart } from "./widget_chart";

export const AttributesHybridAnalogStep1 = {
  title: "Rail distance",
  description: [
    `Do not touch the sensor, and press "Next" button to check current setting.`
  ]
};
export const AttributesHybridAnalogStep2 = {
  title: "Tune GCBC",
  description: [
    `Do not touch the sensor, and press "Start" button. WebDS will suggest new setting after calculation.`
  ]
};
interface IProps {
  updateInitState: any;
  onDone: any;
  onContentUpdate: any;
  updateTuningResult: any;
  onBusy: any;
}

interface ADCData {
  x: {
    min: number;
    max: number;
  };
  y: {
    min: number;
    max: number;
  };
}

const BUTTON_RADIUS = 2;
const BUTTON_WIDTH = 100;

export const TutorInputRailRange = (props: IProps) => {
  const state = "idle";

  const preMin = useRef([0, 0]);
  const preMax = useRef([0, 0]);
  function updateContent(content: any) {
    props.onContentUpdate(content);
  }

  function drawChart() {
    return (
	  
      //<ADCChart />
      <Chart
        cap={0}
        effective={0}
        inscale={0}
        min={preMin.current}
        max={preMax.current}
        step1={true}
        last={false}
      />
    );
  }
  useEffect(() => {
    try {
      SendGetADC("HybridAnalog").then((d) => {
        let data = d as ADCData;
        console.log("DATA", data.x.min, data.y.min);
        preMin.current = [data.x.min, data.y.min];
        preMax.current = [data.x.max, data.y.max];
        props.updateTuningResult({
          preMin: preMin.current,
          preMax: preMax.current
        });
        updateContent(drawChart());
      });
    } catch (e) {
      alert(e.toString());
    }
  }, []);

  return (
    <Stack
      direction="column"
      spacing={3}
      sx={{ width: "100%", height: "100%" }}
    >
      <Typography
        sx={{
          display: "inline-block",
          whiteSpace: "pre-line",
          fontSize: 12
        }}
      >
        The rail distance is the buffer setup to avoid clipping. Do not touch
        the sensor, and press "Next" button to check current setting.
      </Typography>
      <Stack alignItems="center" sx={{ m: 2 }}>
        {state === "idle"}
        <Button
          sx={{ width: BUTTON_WIDTH, borderRadius: BUTTON_RADIUS }}
          onClick={() => {
            props.onDone({});
          }}
        >
          Next
        </Button>
      </Stack>
    </Stack>
  );
};
