import React from "react";

import { useTranslation } from "react-i18next";

import { ChevronLeftIcon, ChevronRightIcon } from "@src/assets/image/icons";

import { Typography } from "@components/atoms";

export const OnboardingCodeSettingsStep = () => {
	const { t } = useTranslation("tour");

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<Typography className="font-semibold text-white" element="h4" size="xl">
						{t("onboarding.steps.projectCode.title")}
					</Typography>
					<Typography className="mt-1 text-gray-300" element="p" size="small">
						{t("onboarding.steps.projectCode.content")}
					</Typography>
				</div>
				<ChevronRightIcon className="ml-4 size-7 shrink-0 fill-white" />
			</div>

			<div className="h-px w-full bg-gray-700" />

			<div className="flex w-full items-center justify-between">
				<ChevronLeftIcon className="mr-4 size-7 shrink-0 fill-white" />
				<div className="w-full flex-1">
					<Typography className="font-semibold text-white" element="h4" size="large">
						{t("onboarding.steps.projectSettings.title")}
					</Typography>
					<Typography className="mt-1 text-gray-300" element="p" size="small">
						{t("onboarding.steps.projectSettings.content")}
					</Typography>
				</div>
			</div>
		</div>
	);
};
