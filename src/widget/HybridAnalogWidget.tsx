import React from "react";

import { ReactWidget } from "@jupyterlab/apputils";

import { HybridAnalogComponent } from "./HybridAnalogComponent";

export class HybridAnalogWidget extends ReactWidget {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + "_component"}>
        <HybridAnalogComponent />
      </div>
    );
  }
}

export default HybridAnalogWidget;
