import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { FileArrowRightIcon } from "@assets/image/icons";

export const ManualRunSuccessToastMessage = ({ projectId, sessionId }: { projectId?: string; sessionId?: string }) => {
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const navigate = useNavigate();

	return (
		<button
			aria-label={t("executionSucceed")}
			className="px-4 py-3 cursor-pointer"
			onClick={() => navigate(`/projects/${projectId}/sessions/${sessionId}`)}
		>
			<div className="flex flex-col">
				<span className="font-semibold text-green-800">{t("executionSucceed")}</span>
				<div className="mt-0.5 flex items-center gap-1 p-0 text-green-800 underline">
					{t("viewSessionOutput")} <FileArrowRightIcon className="size-4 animate-pulse stroke-green-800" />
				</div>
			</div>
		</button>
	);
};
