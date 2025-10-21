import React from "react";

import { useTranslation } from "react-i18next";

import { Typography } from "@components/atoms";

export const SocialProof = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "ai.socialProof" });

	return (
		<div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
			<div className="flex items-center gap-2">
				<span className="text-2xl">🔥</span>
				<Typography className="text-sm text-gray-300" element="span">
					{t("workflowsDeployed")}
				</Typography>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-2xl">⭐</span>
				<Typography className="text-sm text-gray-300" element="span">
					{t("developersBuilding")}
				</Typography>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-2xl">🔒</span>
				<Typography className="text-sm text-gray-300" element="span">
					{t("secureCompliant")}
				</Typography>
			</div>
		</div>
	);
};
