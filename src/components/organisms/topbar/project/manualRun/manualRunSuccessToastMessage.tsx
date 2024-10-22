import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const navigate = useNavigate();

	return (
		<>
			{t("executionSucceed")}:
			<Button
				className="flex cursor-pointer items-center gap-1 p-0 text-green-800"
				onClick={() => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}`)}
			>
				{t("showMore")}
				<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
			</Button>
		</>
	);
};
