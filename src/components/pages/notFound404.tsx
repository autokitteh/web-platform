import React from "react";

import { Error404 } from "@assets/image";
import { homepageURL } from "@constants/global.constants";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const NotFound404 = () => {
	const { t } = useTranslation(["notFound404"]);

	return (
		<div className="flex flex-col h-full items-center justify-center w-full">
			<Error404 className="w-1/3" />

			<div className="font-fira-code mt-16 text-black text-lg">{t("pageNotFound404")}</div>

			<Link className="font-bold font-fira-code mt-4 text-black text-lg" to={homepageURL}>
				{t("goToHomepage")}
			</Link>
		</div>
	);
};
