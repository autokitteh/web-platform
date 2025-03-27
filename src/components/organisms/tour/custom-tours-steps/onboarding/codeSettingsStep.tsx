import React from "react";

import { useTranslation } from "react-i18next";

import { getArrowStyles } from "@constants";

import { Typography, DashedArrow } from "@components/atoms";

export const CodeSettingsStep = () => {
	const { t } = useTranslation("tour");

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="relative w-full flex-1">
				<Typography className="font-semibold text-white" element="h4" size="large">
					{t("onboarding.steps.projectSettings.title")}
				</Typography>
				<Typography className="mt-1 text-gray-300" element="p" size="small">
					<div className="relative z-20 bg-gray-850 py-1">
						{t("onboarding.steps.projectSettings.content")}
					</div>
					<DashedArrow className="absolute z-10" style={getArrowStyles("topLeft")} />
				</Typography>
			</div>

			<div className="h-px w-full bg-gray-700" />

			<div className="relative flex-1">
				<Typography className="font-semibold text-white" element="h4" size="xl">
					{t("onboarding.steps.projectCode.title")}
				</Typography>

				<Typography className="mt-1 text-gray-300" element="p" size="small">
					<div className="relative z-20 bg-gray-850 py-1">{t("onboarding.steps.projectCode.content")}</div>
					<DashedArrow className="absolute z-10" style={getArrowStyles("topRight")} />{" "}
				</Typography>
			</div>
		</div>
	);
};
