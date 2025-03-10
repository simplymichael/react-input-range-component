import React from "react";
import { createRoot } from "react-dom/client";
import ExampleApp from "./example-app";
import "../../src/scss/index.scss";
import "../scss/index.scss";

createRoot(document.getElementById("app")).render(
  <ExampleApp />
);
