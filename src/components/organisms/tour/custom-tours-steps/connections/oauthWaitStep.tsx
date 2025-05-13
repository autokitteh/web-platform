import React from "react";

import { useTranslation } from "react-i18next";

import { useToastStore, useTourStore } from "@src/store";

import { Button, Typography } from "@components/atoms";

export const OauthWaitStep = () => {
	const { t } = useTranslation("tour");
	const { prevStep, getLastStepUrl } = useTourStore();
	const { addToast } = useToastStore.getState();

	const goToPrevTourStep = () => {
		const lastStepUrl = getLastStepUrl();
		if (!lastStepUrl) {
			addToast({
				message: t("sharedSteps.noBackUrl"),
				type: "error",
			});
			return;
		}
		prevStep();
	};

	return (
		<div className="flex w-full flex-1 flex-col gap-4">
			<Typography className="font-semibold text-white" element="h4" size="xl">
				{t("sharedSteps.oauthWait.title")}
			</Typography>
			<Typography className="mt-1 text-gray-300" element="p" size="small">
				{t("sharedSteps.oauthWait.content")}
			</Typography>
			<Button
				ariaLabel={t("next.ariaLabel")}
				className="ml-auto h-6 bg-green-800 px-3 text-sm font-semibold text-gray-1200 hover:bg-green-200"
				onClick={goToPrevTourStep}
				variant="filledGray"
			>
				{t("sharedSteps.oauthWait.button")}
			</Button>
		</div>
	);
};
