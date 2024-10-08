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
			<div className="flex items-center gap-1">
				<Button
					className="cursor-pointer p-0 text-white underline"
					onClick={() => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}`)}
				>
					{sessionId}
				</Button>

				<ExternalLinkIcon className="size-3.5 fill-white duration-200" />
			</div>
		</>
	);
};
