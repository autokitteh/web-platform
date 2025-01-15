import React from "react";

import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { homepageURL } from "@constants/global.constants";

export const CustomError = () => {
	const { t } = useTranslation("global", { keyPrefix: "customError" });
	const location = useLocation();
	const stateError = location.state as { error?: string };

	return (
		<div className="flex w-full flex-1 flex-col items-center justify-center py-5">
			<div className="mt-16 font-fira-code text-lg text-black">
				{t("error")}: {stateError?.error}
			</div>

			<Link className="mt-4 font-fira-code text-lg font-bold text-black" to={homepageURL}>
				{t("goToHomepage")}
			</Link>
		</div>
	);
};
