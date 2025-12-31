import React from "react";

import { useTranslation } from "react-i18next";

import { useNavigateWithSettings } from "@utilities";

import { FileArrowRightIcon } from "@assets/image/icons";

export const ManualRunSuccessToastMessage = ({ projectId, sessionId }: { projectId?: string; sessionId?: string }) => {
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const navigateWithSettings = useNavigateWithSettings();

	return (
		<button
			aria-label={t("executionSucceed")}
			className="cursor-pointer px-4 py-3"
			onClick={() => navigateWithSettings(`/projects/${projectId}/sessions/${sessionId}`)}
		>
			<div className="font-semibold text-green-800">{t("executionSucceed")}</div>
			<div className="mt-0.5 flex items-center gap-1 p-0 text-green-800 underline">
				{t("viewSessionOutput")} <FileArrowRightIcon className="size-4 animate-pulse stroke-green-800" />
			</div>
		</button>
	);
};
