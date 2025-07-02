import React from "react";

import { useTranslation } from "react-i18next";

import { BillingSwitcherProps } from "@src/interfaces";
import { cn } from "@src/utilities";

export const BillingSwitcher = ({ selectedType, onTypeChange }: BillingSwitcherProps) => {
	const { t } = useTranslation("billing");

	return (
		<div className="flex h-8 items-center gap-1 rounded-lg border border-green-800/60 px-1">
			<button
				className={cn(
					"rounded-md px-3 py-0.5 text-sm font-medium transition-colors hover:bg-green-400 hover:text-gray-1100",
					selectedType === "monthly"
						? "bg-green-800 text-gray-1250 hover:bg-green-400"
						: "text-gray-300 hover:text-gray-1100"
				)}
				onClick={() => onTypeChange("monthly")}
			>
				{t("monthly")}
			</button>
			<button
				className={cn(
					"rounded-md px-3 py-0.5 text-sm font-medium transition-colors hover:bg-green-400 hover:text-gray-1100",
					selectedType === "yearly"
						? "bg-green-800 text-gray-1250 hover:bg-green-400"
						: "text-gray-300 hover:text-gray-1100"
				)}
				onClick={() => onTypeChange("yearly")}
			>
				{t("yearly")}
			</button>
		</div>
	);
};
