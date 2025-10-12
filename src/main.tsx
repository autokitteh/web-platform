import React from "react";

import { datadogRum } from "@datadog/browser-rum";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import ReactDOM from "react-dom/client";

import { datadogConstants, ddConfigured } from "@constants";
import { MainApp } from "@src/mainApp";

import "./assets/index.css";
import "./i18n";

TimeAgo.addDefaultLocale(en);

if (ddConfigured) {
	datadogRum.init(datadogConstants);
}

ReactDOM.createRoot(document.getElementById("root")!).render(<MainApp />);
