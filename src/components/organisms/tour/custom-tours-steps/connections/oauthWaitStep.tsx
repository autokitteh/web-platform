import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useTourStore } from "@src/store";

import { Button, Typography } from "@components/atoms";

export const OauthWaitStep = () => {
	const { t } = useTranslation("tour");
	const { prevStep } = useTourStore();
	const navigate = useNavigate();

	const handleRestartOauth = () => {
		prevStep();
		navigate(-1);
	};

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex-1">
				<Typography className="font-semibold text-white" element="h4" size="xl">
					{t("sharedSteps.oauthWait.title")}
				</Typography>
				<Typography className="mt-1 text-gray-300" element="p" size="small">
					{t("sharedSteps.oauthWait.content")}
				</Typography>
				<Button
					ariaLabel={t("next.ariaLabel")}
					className="absolute bottom-5 right-5 h-6 bg-green-800 px-3 pt-2.5 text-sm font-semibold text-gray-1200 hover:bg-green-200"
					onClick={handleRestartOauth}
					variant="filledGray"
				>
					{t("sharedSteps.oauthWait.button")}
				</Button>
			</div>
		</div>
	);
};
