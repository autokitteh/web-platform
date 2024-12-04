import React from "react";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import ReactDOM from "react-dom/client";

import { MainApp } from "@src/mainApp";
import "./assets/index.css";
import "./i18n";

TimeAgo.addDefaultLocale(en);

ReactDOM.createRoot(document.getElementById("root")!).render(<MainApp />);
