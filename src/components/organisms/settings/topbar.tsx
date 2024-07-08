import React from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@utilities";

export const SettingsTopbar = () => {
	const { t } = useTranslation("settings", { keyPrefix: "topbar" });

	const styleInput = cn(
		"font-bold p-0 text-xl leading-6 bg-transparent min-w-3 outline outline-0 rounded leading-tight"
	);

	return (
		<div className="flex items-center justify-between gap-5 rounded-b-xl bg-gray-800 py-3 pl-7 pr-3.5">
			<div className="relative flex items-end gap-3 font-fira-code text-gray-300">
				<span className={styleInput}>{t("title")}</span>
			</div>
		</div>
	);
};
