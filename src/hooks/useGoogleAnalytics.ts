import React from "react";

import ga4 from "react-ga4";
import { useLocation } from "react-router-dom";

import { googleAnalytics4Id } from "@src/constants";

const isProduction = process.env.NODE_ENV === "production";

export const init = () =>
	ga4.initialize(googleAnalytics4Id, {
		testMode: !isProduction,
	});

export const sendPageview = (path: string) =>
	ga4.send({
		hitType: "pageview",
		page: path,
	});

export function useGoogleAnalytics() {
	const location = useLocation();

	React.useEffect(() => {
		init();
	}, []);

	React.useEffect(() => {
		const path = location.pathname + location.search;
		sendPageview(path);
	}, [location]);
}
