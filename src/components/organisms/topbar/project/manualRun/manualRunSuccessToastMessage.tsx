import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useNavigateWithSettings } from "@utilities";

import { Button } from "@components/atoms";

import { ExternalLinkIcon } from "@assets/image/icons";

export const ManualRunSuccessToastMessage = ({
	deploymentId,
	projectId,
	sessionId,
}: {
	deploymentId?: string;
	projectId?: string;
	sessionId?: string;
}) => {
	const { t } = useTranslation("deployments", {
		keyPrefix: "history.manualRun",
	});

	const navigateWithSettings = useNavigateWithSettings();
	const goToSession = () =>
		deploymentId
			? navigateWithSettings(`/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}`)
			: navigateWithSettings(`/projects/${projectId}/sessions/${sessionId}`);

	return (
		<>
			{t("executionSucceed")}
			<Button className="flex cursor-pointer items-center gap-1 p-0 text-green-800" onClick={goToSession}>
				{t("showMore")}
				<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
			</Button>
		</>
	);
};
