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
		<button
			aria-label={t("executionSucceed")}
			className="cursor-pointer p-4"
			onClick={() => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}`)}
		>
			<div className="flex flex-col">
				<span className="font-semibold text-green-800">{t("executionSucceed")}</span>
				<Button className="flex items-center gap-1 p-0 text-green-800 underline">
					{t("showMore")} <ExternalLinkIcon className="size-3 animate-bounce fill-green-800" />
				</Button>
			</div>
		</button>
	);
};
