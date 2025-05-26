import React from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import ReactDOM from "react-dom/client";

import { queryClient } from "@api";
import { MainApp } from "@src/mainApp";

import "./assets/index.css";
import "./i18n";

TimeAgo.addDefaultLocale(en);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<MainApp />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	</React.StrictMode>
);
