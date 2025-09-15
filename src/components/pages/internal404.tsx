import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { homepageURL } from "@constants/global.constants";
import { LoggerService } from "@src/services/logger.service";

import { Error404 } from "@assets/image";

export const Internal404 = () => {
	const { t } = useTranslation(["notFound404"]);
	const location = useLocation();

	useEffect(() => {
		LoggerService.info(
			"404 - Page not found",
			{
				url: window.location.href,
				previousPathname: window.history.state?.previousPathname || "N/A",
				searchParams: location.search,
			},
			{ consoleOnly: true }
		);
	}, [location]);

	return (
		<div className="flex w-full flex-col items-center justify-center py-5">
			<Error404 className="w-1/3" />

			<div className="mt-16 font-fira-code text-lg text-black">{t("pageNotFound404")}</div>

			<Link className="mt-4 font-fira-code text-lg font-bold text-black" to={homepageURL}>
				{t("goToHomepage")}
			</Link>
		</div>
	);
};
