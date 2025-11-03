import React from "react";

import { useTranslation } from "react-i18next";

import { Typography } from "@components/atoms";

export const ProjectConfigStep = () => {
	const { t } = useTranslation("tour", { keyPrefix: "quickstart.steps" });
	return (
		<div className="flex w-full flex-col gap-6">
			<div className="relative w-full flex-1">
				<Typography className="font-semibold text-white" element="h4" size="large">
					{t("projectConfigAwareness.title")}
				</Typography>
				<Typography className="mt-1 text-gray-300" element="p" size="small">
					<div className="relative z-20 bg-gray-850 py-1">{t("projectConfigAwareness.content")}</div>
				</Typography>
			</div>
		</div>
	);
};
