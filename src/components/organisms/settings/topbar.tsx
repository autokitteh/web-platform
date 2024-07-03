import React from "react";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";

export const SettingsTopbar = () => {
	const { t } = useTranslation("settings", { keyPrefix: "topbar" });

	const styleInput = cn(
		"font-bold p-0 text-xl leading-6 bg-transparent min-w-3 outline outline-0 rounded leading-tight"
	);

	return (
		<div className="flex justify-between items-center bg-gray-800 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="flex items-end gap-3 relative font-fira-code text-gray-300">
				<span className={styleInput}>{t("title")}</span>
			</div>
		</div>
	);
};
