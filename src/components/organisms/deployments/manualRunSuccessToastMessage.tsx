import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@components/atoms";

import { ExternalLinkIcon } from "@assets/image/icons";

export const ManualRunSuccessToastMessage = ({
	deploymentId,
	sessionId,
}: {
	deploymentId?: string;
	sessionId?: string;
}) => {
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const navigate = useNavigate();
	const { projectId } = useParams();

	return (
		<>
			{t("executionSucceed")}:
			<div className="flex items-center gap-1">
				<Button
					className="cursor-pointer p-0 text-green-800 underline"
					onClick={() => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}`)}
				>
					{sessionId}
				</Button>

				<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
			</div>
		</>
	);
};
