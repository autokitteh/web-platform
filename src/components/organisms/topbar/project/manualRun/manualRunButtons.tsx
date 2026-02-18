import React, { useCallback, useEffect } from "react";

import { isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { LoggerService } from "@services";
import { namespaces, ProjectActions, tourStepsHTMLIds } from "@src/constants";
import { emptySelectItem } from "@src/constants/forms";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent, useEventListener } from "@src/hooks";
import {
	useCacheStore,
	useManualRunStore,
	useProjectStore,
	useSharedBetweenProjectsStore,
	useToastStore,
} from "@src/store/";
import { UserTrackingUtils } from "@utilities";

import { Button, IconSvg, Spinner } from "@components/atoms";
import { ManualRunSuccessToastMessage } from "@components/organisms/topbar/project";

import { SettingsIcon, RunIcon } from "@assets/image/icons";

export const ManualRunButtons = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const { t: tGenericError } = useTranslation("global");
	const { projectId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);
	const { fetchDeployments, deployments } = useCacheStore();
	const { actionInProcess, setActionInProcess } = useProjectStore();
	const {
		activeDeploymentStore,
		entrypointFunction,
		isManualRunEnabled,
		saveAndExecuteManualRun,
		fetchManualRunConfiguration,
	} = useManualRunStore((state) => ({
		activeDeploymentStore: state.projectManualRun[projectId!]?.activeDeployment,
		entrypointFunction: state.projectManualRun[projectId!]?.entrypointFunction,
		isManualRunEnabled: state.projectManualRun[projectId!]?.isManualRunEnabled,
		saveAndExecuteManualRun: state.saveAndExecuteManualRun,
		fetchManualRunConfiguration: state.fetchManualRunConfiguration,
	}));

	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);

	const isManualRunDrawerOnTop = useSharedBetweenProjectsStore((state) =>
		projectId ? state.drawers[projectId]?.[DrawerName.projectManualRunSettings] : false
	);

	useEffect(() => {
		if (projectId) {
			fetchManualRunConfiguration(projectId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deployments, projectId]);

	const openManualRunSettings = useCallback(() => {
		if (projectId) {
			triggerEvent(EventListenerName.hideProjectManualRunSettings);
			triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
			triggerEvent(EventListenerName.hideProjectConfigSidebar);
			triggerEvent(EventListenerName.hideProjectEventsSidebar);
			openDrawer(projectId, DrawerName.projectManualRunSettings);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const closeManualRunSettings = useCallback(() => {
		if (projectId) {
			closeDrawer(projectId, DrawerName.projectManualRunSettings);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	useEventListener(EventListenerName.hideProjectManualRunSettings, closeManualRunSettings);
	useEventListener(EventListenerName.displayProjectManualRunSettings, openManualRunSettings);

	const startManualRun = useCallback(async () => {
		if (!projectId) return;
		try {
			setActionInProcess(ProjectActions.manualRun, true);
			const { data: sessionId, error } = await saveAndExecuteManualRun(projectId);
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

			if (sessionId) {
				UserTrackingUtils.trackEvent("manual_run_executed", {
					sessionId,
					projectId,
					deploymentId: activeDeploymentStore?.deploymentId,
					entrypoint: entrypointFunction?.value,
				});
			} else {
				addToast({
					message: t("manualRun.executionFailed"),
					type: "error",
				});
				LoggerService.error(
					namespaces.ui.manualRun,
					t("manualRun.executionFailedExtended", { projectId, error: tGenericError("genericError") })
				);

				return;
			}

			addToast({
				message: <ManualRunSuccessToastMessage projectId={projectId} sessionId={sessionId} />,
				type: "success",
				position: "top-right",
				offset: 50,
				hiddenCloseButton: true,
				className: "rounded-2xl p-0 border-2",
				customTitle: " ",
				closeOnClick: true,
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
				disabled={!isManualRunEnabled || !!isManualRunDrawerOnTop}
				onClick={openManualRunSettings}
				title={t("ariaSettingsRun")}
				variant="light"
			>
				<IconSvg
					className="fill-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
					src={SettingsIcon}
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
