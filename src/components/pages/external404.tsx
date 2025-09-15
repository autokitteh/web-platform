import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { LoggerService } from "@src/services/logger.service";

import { Error404 } from "@assets/image";

export const External404 = () => {
	const { t } = useTranslation(["notFound404"]);
	const location = useLocation();

	useEffect(() => {
		LoggerService.info(
			"404 - External page not found",
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
			<a className="mt-4 font-fira-code text-lg font-bold text-black" href="/">
				{t("goToHomepage")}
			</a>
		</div>
	);
};
