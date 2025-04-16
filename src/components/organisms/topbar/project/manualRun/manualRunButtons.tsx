import React, { useCallback } from "react";

import { isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { LoggerService } from "@services";
import { namespaces, tourStepsHTMLIds } from "@src/constants";
import { emptySelectItem } from "@src/constants/forms";
import { ProjectActions } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useCacheStore, useDrawerStore, useManualRunStore, useProjectStore, useToastStore } from "@src/store/";

import { Button, IconSvg, Spinner } from "@components/atoms";
import { ManualRunSuccessToastMessage } from "@components/organisms/topbar/project";

import { GearIcon, RunIcon } from "@assets/image/icons";

export const ManualRunButtons = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const { projectId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const { openDrawer } = useDrawerStore();
	const { fetchDeployments } = useCacheStore();
	const { actionInProcess, setActionInProcess } = useProjectStore();
	const { activeDeploymentStore, entrypointFunction, isManualRunEnabled, saveProjectManualRun } = useManualRunStore(
		(state) => ({
			activeDeploymentStore: state.projectManualRun[projectId!]?.activeDeployment,
			entrypointFunction: state.projectManualRun[projectId!]?.entrypointFunction,
			isManualRunEnabled: state.projectManualRun[projectId!]?.isManualRunEnabled,
			saveProjectManualRun: state.saveAndExecuteManualRun,
		})
	);

	const openManualRunSettings = useCallback(() => {
		openDrawer(DrawerName.projectManualRunSettings);
	}, [openDrawer]);

	const startManualRun = useCallback(async () => {
		if (!projectId) return;
		try {
			setActionInProcess(ProjectActions.manualRun, true);
			const { data: sessionId, error } = await saveProjectManualRun(projectId);
			if (error) {
				addToast({
					message: t("manualRun.executionFailed"),
					type: "error",
				});
				LoggerService.error(
					namespaces.ui.manualRun,
					t("manualRun.executionFailedExtended", { projectId, error })
				);

				return;
			}
			addToast({
				message: (
					<ManualRunSuccessToastMessage
						deploymentId={activeDeploymentStore?.deploymentId}
						projectId={projectId}
						sessionId={sessionId}
					/>
				),
				type: "success",
			});
			setTimeout(() => {
				fetchDeployments(projectId, true);
			}, 100);
		} finally {
			setActionInProcess(ProjectActions.manualRun, false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const isRunDisabled = isEqual(entrypointFunction, emptySelectItem) || Object.values(actionInProcess).some(Boolean);

	return (
		<div className="relative flex h-8 gap-1.5 self-center rounded-3xl border border-gray-750 p-1 transition hover:border-white">
			<Button
				ariaLabel={t("ariaSettingsRun")}
				className="group h-full whitespace-nowrap p-1 hover:bg-gray-1050 active:bg-black"
				disabled={!isManualRunEnabled}
				onClick={openManualRunSettings}
				title={t("ariaSettingsRun")}
				variant="light"
			>
				<IconSvg
					className="stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
					src={GearIcon}
				/>
			</Button>

			<div className="w-px bg-gray-750 transition" />

			<Button
				ariaLabel={t("manual")}
				className="group h-full gap-2 whitespace-nowrap hover:bg-gray-1050 active:bg-black"
				disabled={isRunDisabled}
				id={tourStepsHTMLIds.manualRunButton}
				onClick={startManualRun}
				variant="light"
			>
				<IconSvg
					className="stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
					src={actionInProcess[ProjectActions.manualRun] ? Spinner : RunIcon}
				/>

				<span className="mt-0.5">{t("manual")}</span>
			</Button>
		</div>
	);
};
