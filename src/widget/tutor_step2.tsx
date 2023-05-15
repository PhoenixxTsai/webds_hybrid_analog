import React, { useEffect, useState, useRef } from "react";

import { Typography, Stack, Button, Box, Paper } from "@mui/material";

import { Chart, RailValue } from "./widget_chart";

import {
  SendUpdateStaticConfig,
  SendRun,
  SendTutorAction,
  SendGetADC,
  SendGetImage,
  SendGetSetting
} from "./tutor_api";

export const AttributesMaxCapacitance = {
  title: "Tune GCBC",
  description: []
};

interface IProps {
  updateInitState: any;
  onContentUpdate: any;
  onDone: any;
  onBusy: any;
  tuningParams: any;
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

interface TuningResult {
  x: { cap: number; inscale: number; effective: number };
  y: { cap: number; inscale: number; effective: number };
}

const rpi4 = true;
export const TutorHybridAnalog = (props: IProps) => {
  const BUTTON_RADIUS = 2;
  const BUTTON_WIDTH = 100;
  const BUTTON_HEIGHT = 36;
  const [state, setState] = React.useState("");
  const [progress, setProgress] = useState(0);

  const eventSource = useRef<undefined | EventSource>(undefined);
  const eventError = useRef(false);
  const sseTimer = useRef(0);

  const tunedParam = useRef([]);

  let result: TuningResult;
  let preAdc: ADCData;
  let postAdc: ADCData;
  const min = useRef<number[]>([]);
  const max = useRef<number[]>([]);
  const cap = useRef<number[]>([]);
  const effective = useRef<number[]>([]);
  const inscale = useRef<number[]>([]);
  const config = useRef<string>();
  
  function updateContent(content: any) {
    props.onContentUpdate(content);
  }

  const eventType = "HybridAnalog";
  const eventRoute = "/webds/tutor/event";

  const eventHandler = (event: any) => {
    const data = JSON.parse(event.data);
    console.log("eventHandler", data.state);

    if (data.state === "run") {
      setProgress(data.progress);
      if (data.data !== undefined) {
        result = data.data as TuningResult;
        config.current = data.data.config;
        console.log("config", config.current);

        cap.current.push(result.x.cap);
        cap.current.push(result.y.cap);
        inscale.current.push(result.x.inscale);
        inscale.current.push(result.y.inscale);
        effective.current.push(result.x.effective);
        effective.current.push(result.y.effective);
        console.log("TuningResult", result);
      }
      if (data.progress === 100) {
        SendGetADC("HybridAnalog").then((r) => {
          postAdc = r as ADCData;
          console.log("postImage", postAdc);
          updateContent(drawChart(true));
          setState("done");
        });
      }
    } else if (data.state === "finish") {
    }
  };

  const removeEvent = () => {
    const SSE_CLOSED = 2;
    if (eventSource.current && eventSource.current!.readyState !== SSE_CLOSED) {
      eventSource.current!.removeEventListener(eventType, eventHandler, false);
      eventSource.current!.close();
      eventSource.current = undefined;
    }
  };
  const errorHandler = (error: any) => {
    eventError.current = true;
    removeEvent();
    console.error(`Error on GET ${eventRoute}\n${error}`);
  };
  const addEvent = () => {
    setProgress(0);
    if (eventSource.current) {
      return;
    }
    eventError.current = false;
    eventSource.current = new window.EventSource(eventRoute);
    eventSource.current!.addEventListener(eventType, eventHandler, false);
    eventSource.current!.addEventListener("error", errorHandler, false);
  };

  async function SendRunHybridAnalog() {
    SendRun("HybridAnalog", RailValue)
      .then((ret) => {
        console.log(ret);
      })
      .catch((err) => {
        alert(err);
      });
  }

  function getHybridRange(data: any, key: string) {
    var x = data["x"];
    var y = data["y"];
    return [x[key], y[key]];
  }

  function drawChartBefore() {
    effective.current = getHybridRange(tunedParam.current, "effective");
    cap.current = getHybridRange(tunedParam.current, "cap");
    inscale.current = getHybridRange(tunedParam.current, "inscale");
    console.log("drawChartBefore", cap);
    let p = preAdc;
    min.current = [p.x.min, p.y.min];
    max.current = [p.x.max, p.y.max];
    console.log("min.current", min);
    return (
      <Chart
        effective={effective.current}
        cap={cap.current}
        inscale={inscale.current}
        min={min.current}
        max={max.current}
        last={false}
        step1={false}
      />
    );
  }
  function drawChart(last: any) {
    let p = postAdc;
    let postmax = [p.x.max, p.y.max];
    console.log("postmax", postmax);
    let postmin = [p.x.min, p.y.min];

    let _max = max.current.concat(postmax);
    let _min = min.current.concat(postmin);
    return (
      <Chart
        cap={cap.current}
        inscale={inscale.current}
        effective={effective.current}
        max={_max}
        min={_min}
        last={last}
        step1={false}
      />
    );
  }
  function getPreImage() {
    SendGetSetting("HybridAnalog")
      .then((ret) => {
        tunedParam.current = ret;
        console.log("tunedParam", tunedParam.current);
        //setState("done");
      })
      .then((ret) => {
        SendGetADC("HybridAnalog").then((r) => {
          preAdc = r as ADCData;
          console.log("preImage", preAdc);
          updateContent(drawChartBefore());
        });
      })
      .catch((err) => {
        alert("eventHandler error");
        alert(err);
      });
  }

  async function testSSE() {
    SendRun("HybridAnalog", RailValue)
      .then((ret) => {
        console.log("TuningResult", ret);
      })
      .then((ret) => {
        SendGetImage("raw").then((r) => {
          postAdc = r as ADCData;
          console.log("postImage", postAdc);
          //updateContent(drawChart(true));
          setState("done");
        });
      })
      .catch((err) => {
        alert(err);
      });

    let counter = 0;
    sseTimer.current = setInterval(() => {
      counter = counter + 1;
      setProgress(counter);
      if (counter === 100) {
        clearInterval(sseTimer.current);
      }
    }, 70);
  }

  async function action(action: any) {
    let data;

    console.log("ACTION", action);
    setState(action);
    switch (action) {
      case "start":
        setState("process");
        setProgress(0);

        if (rpi4) {
          addEvent();
          await SendRunHybridAnalog();
        } else {
          testSSE();
        }
        break;
      case "terminate":
        if (rpi4) {
          removeEvent();
          try {
            await SendTutorAction("HybridAnalog", "terminate", {});
          } catch (e) {
            alert(e.toString());
          }
        } else {
          clearInterval(sseTimer.current);
        }
        setState("");
        break;
      case "cancel":
        data = await SendUpdateStaticConfig({});
        console.log(data);
        break;

      default:
        break;
    }
  }

  useEffect(() => {
    console.log("TUTOR HYBRID ANALOG INIT");
    getPreImage();
    updateContent(<></>);
    props.updateInitState(true);
  }, []);

  function showProgress() {
    return (
      <Stack direction="row" justifyContent="center" alignItems="center">
        <Box
          sx={{
            width: BUTTON_WIDTH,
            height: "98%",
            position: "relative",
            display: "inline-flex",
            borderRadius: BUTTON_RADIUS,
            overflow: "hidden"
          }}
        >
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "left"
            }}
          >
            <Paper
              sx={{
                bgcolor: "#ecebe5",
                borderRadius: BUTTON_RADIUS
              }}
            />
          </Box>
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "left"
            }}
          >
            <Paper
              sx={{
                bgcolor: "#ffa777",
                width: progress < 2 ? 0 : (progress * BUTTON_WIDTH) / 100,
                height: "98%",
                borderRadius: 0
              }}
            />
          </Box>
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Typography variant="overline" display="block">
              Cancel
            </Typography>
          </Box>
          <Button
            onClick={() => {
              action("terminate");
            }}
            variant="outlined"
            sx={{
              width: BUTTON_WIDTH,
              height: BUTTON_HEIGHT,
              borderRadius: BUTTON_RADIUS,
              border: 1
            }}
          />
        </Box>
      </Stack>
    );
  }
  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" alignItems="flex-start" spacing={3} sx={{ m: 1 }}>
        <Stack direction="column">
          <Typography
            sx={{
              display: "inline-block",
              whiteSpace: "pre-line",
              fontSize: 14
            }}
          >
            Do not touch the sensor, and press "Start" button. WebDS will
            suggest new setting after calculation.
          </Typography>
        </Stack>
      </Stack>
      <Stack alignItems="center" sx={{ m: 2 }}>
        {state === "process" && showProgress()}
        {state === "done" && (
          <Button
            //disabled={dataReady === false}
            sx={{
              width: 100,
              borderRadius: 2
            }}
            onClick={() => {
              props.onDone(config.current);
            }}
          >
            Done
          </Button>
        )}
        {state === "" && (
          <Button
            sx={{
              width: 100,
              borderRadius: 2
            }}
            onClick={() => {
              action("start");
            }}
          >
            Start
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
