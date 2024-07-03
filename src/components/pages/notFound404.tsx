import React from "react";
import { Error404 } from "@assets/image";
import { homepageURL } from "@constants/global.constants";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const NotFound404 = () => {
	const { t } = useTranslation(["notFound404"]);
	return (
		<div className="flex flex-col w-full h-full justify-center items-center">
			<Error404 className="w-1/3" />
			<div className="text-black mt-16 text-lg font-fira-code">{t("pageNotFound404")}</div>
			<Link className="text-black text-lg mt-4 font-fira-code font-bold" to={homepageURL}>
				{t("goToHomepage")}
			</Link>
		</div>
	);
};
