import React from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@utilities";

export const SettingsTopbar = () => {
	const { t } = useTranslation("settings", { keyPrefix: "topbar" });

	const styleInput = cn(
		"font-bold p-0 text-xl leading-6 bg-transparent min-w-3 outline outline-0 rounded leading-tight"
	);

	return (
		<div className="bg-gray-800 flex gap-5 items-center justify-between pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="flex font-fira-code gap-3 items-end relative text-gray-300">
				<span className={styleInput}>{t("title")}</span>
			</div>
		</div>
	);
};
