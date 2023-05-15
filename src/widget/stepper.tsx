import React, { useState, useEffect, useRef } from "react";

import {
  Button,
  Stack,
  Typography,
  Box,
  Divider,
  Stepper,
  Step,
  StepContent,
  Avatar,
  Snackbar,
  Alert
} from "@mui/material";

import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import {
  TutorInputRailRange,
  AttributesHybridAnalogStep1,
  AttributesHybridAnalogStep2
} from "./tutor_step1";
import { TutorHybridAnalog } from "./tutor_step2";

import { TutorFinish, AttributesFinish } from "./tutor_finish";

interface IProps {
  step: number;
  updateStep: any;
  onBusy: any;
}

interface IAlertInfo {
  state: boolean;
  message: string;
  severity: "error" | "info" | "success" | "warning";
}

interface ITuningResult {
  //x then y
  preMin: [];
  preMax: [];
}

export const ContentStepper = (props: IProps): JSX.Element => {
  const [process, setProcess] = useState(false);
  const [initState, setInitState] = useState(false);
  const [activeStep, setActiveStep] = useState(props.step);
  const [content, setContent] = useState(<></>);
  const [openAlert, setOpenAlert] = useState<IAlertInfo>({
    state: false,
    message: "",
    severity: "info"
  });

  const tuningResult = useRef<ITuningResult>({
    preMin: [],
    preMax: []
  });
  const config = useRef({});

  useEffect(() => {
    setActiveStep(props.step);
  }, [props.step]);

  useEffect(() => {
    console.log(initState);
  }, []);

  function updateBusy(state: any) {
    setProcess(state);
    props.onBusy(state);
  }

  function updateTuningResult(result: ITuningResult) {
    tuningResult.current = result;
  }

  function updateInitState(state: any) {
    console.log("STEP updateInitState:", state);
    setInitState(!state);
  }

  function updateStep(step: any) {
    props.updateStep(step);
  }

  function handleStep(step: number) {
    setActiveStep(step);
    updateStep(step);
  }

  function onDone(data: any) {
    if (activeStep === 2) {
      handleStep(0);
      config.current = {};
    } else {
      console.log("SAVE CONFIG:", data);
      config.current = Object.assign({}, config.current, data);
      console.log("CONFIG ALL:", config.current);
      handleStep(activeStep + 1);
    }
  }

  const handleCloseAlert = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert({ ...openAlert, state: false });
  };

  function displayAlert() {
    return (
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        open={openAlert.state}
        autoHideDuration={2000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={openAlert.severity}
          sx={{ width: "100%" }}
        >
          {openAlert.message}
        </Alert>
      </Snackbar>
    );
  }

  function onConentUpdate(data: any) {
    setContent(data);
  }

  const steps = [
    {
      label: AttributesHybridAnalogStep1.title,
      content: (
        <TutorInputRailRange
          onContentUpdate={onConentUpdate}
          onDone={(data: any) => {
            onDone(data);
          }}
          updateInitState={updateInitState}
          updateTuningResult={updateTuningResult}
          onBusy={(busy: any) => {
            updateBusy(busy);
          }}
        />
      )
    },
    {
      label: AttributesHybridAnalogStep2.title,
      content: (
        <TutorHybridAnalog
          tuningParams={[
            tuningResult.current["preMax"],
            tuningResult.current["preMin"]
          ]}
          updateInitState={updateInitState}
          onContentUpdate={onConentUpdate}
          onDone={(data: any) => {
            onDone(data);
          }}
          onBusy={(busy: any) => {
            updateBusy(busy);
          }}
        />
      )
    },
    {
      label: AttributesFinish.title,
      content: (
        <TutorFinish
          updateInitState={updateInitState}
          onContentUpdate={onConentUpdate}
          config={config.current}
          onDone={(data: any) => {
            onDone(data);
          }}
          onMessage={(m: any) => {
            setOpenAlert(m);
          }}
        />
      )
    }
  ];

  useEffect(() => {}, []);

  function displayStepText(label: any, index: number) {
    let labelColor = "text.disabled";
    if (index === props.step) {
      labelColor = "text.primary";
    }

    return (
      <Typography
        sx={{ fontWeight: "bold", fontSize: 14 }}
        color={labelColor}
        variant="caption"
      >
        {label}
      </Typography>
    );
  }

  function displayStepIcon(index: number) {
    let error = false;
    const param = {
      bgcolor: "primary",
      width: 24,
      height: 24,
      mr: 2,
      color: "inherit"
    };

    switch (index) {
      case 0:
        break;
      case 2:
        //error = true;
        break;
      default:
        break;
    }

    if (index === activeStep) {
      param.bgcolor = "#007dc3";
    }

    if (error) {
      param.bgcolor = "red";
      param.color = "white";
    }

    return (
      <Avatar sx={param}>
        {error ? (
          <PriorityHighIcon sx={{ fontSize: 16 }} />
        ) : (
          <Typography sx={{ fontSize: 14, color: "white" }}>
            {index + 1}
          </Typography>
        )}
      </Avatar>
    );
  }

  function showStep() {
    return (
      <Stack>
        <Stepper
          nonLinear
          activeStep={activeStep}
          orientation="vertical"
          sx={{ pl: 2, pt: 2 }}
        >
          {steps.map((step: any, index: any) => (
            <Step key={step.label}>
              <Button
                disabled={process}
                variant="text"
                onClick={() => handleStep(index)}
                style={{ justifyContent: "flex-start" }}
                sx={{ pl: 0, width: "100%" }}
              >
                {displayStepIcon(index)}
                {displayStepText(step.label, index)}
              </Button>
              <StepContent>
                <Box sx={{ m: 1, minHeight: 300 }}>
                  <div>{step.content}</div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Stack>
    );
  }

  return (
    <Stack direction="column">
      <Stack direction="row">
        <Stack sx={{ width: "50%" }}>{showStep()}</Stack>
        <Divider orientation="vertical" flexItem />
        <Stack sx={{ width: "50%" }}>{content}</Stack>
      </Stack>
      {displayAlert()}
    </Stack>
  );
};
