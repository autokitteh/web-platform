import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { BuildsService, LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { DeploymentStateVariant } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useCacheStore, useDrawerStore, useManualRunStore, useToastStore } from "@src/store/";
import { convertBuildRuntimesToViewTriggers } from "@src/utilities";

import { Button, Frame, IconSvg, Loader, Spinner } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import {
	DeploymentsTableContent,
	ManualRunSettingsDrawer,
	ManualRunSuccessToastMessage,
} from "@components/organisms/deployments";

import { GearIcon, RunIcon } from "@assets/image/icons";

export const DeploymentsTable = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const addToast = useToastStore((state) => state.addToast);
	const { openDrawer } = useDrawerStore();
	const { projectId } = useParams();
	const {
		deployments,
		fetchDeployments,
		loading: { deployments: loadingDeployments },
	} = useCacheStore();

	useEffect(() => {
		fetchDeployments(projectId!, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const [isManualRunEnabled, setIsManualRunEnabled] = useState(false);
	const [savingManualRun, setSavingManualRun] = useState(false);
	const { entrypointFunction, lastDeploymentStore, saveProjectManualRun, updateProjectManualRun } = useManualRunStore(
		(state) => ({
			lastDeploymentStore: state.projectManualRun[projectId!]?.lastDeployment,
			entrypointFunction: state.projectManualRun[projectId!]?.entrypointFunction,
			updateProjectManualRun: state.updateProjectManualRun,
			saveProjectManualRun: state.saveProjectManualRun,
		})
	);

	const loadSingleshotArgs = async () => {
		if (!deployments?.length || !projectId) return;

		const lastDeployment = deployments?.[0];

		if (lastDeployment.state !== DeploymentStateVariant.active) {
			setIsManualRunEnabled(false);

			return;
		}

		if (lastDeployment.buildId === lastDeploymentStore?.buildId) {
			setIsManualRunEnabled(true);

			return;
		}

		const { data: buildDescription, error: buildDescriptionError } = await BuildsService.getBuildDescription(
			lastDeployment.buildId
		);

		if (buildDescriptionError) {
			addToast({
				message: t("buildInformationForSingleshotNotLoaded"),
				type: "error",
			});

			return;
		}
		const buildInfo = JSON.parse(buildDescription!);
		const files = convertBuildRuntimesToViewTriggers(buildInfo.runtimes);

		if (!Object.values(files).length) return;

		updateProjectManualRun(projectId, { files, lastDeployment }, true);
		setIsManualRunEnabled(true);
	};

	useEffect(() => {
		loadSingleshotArgs();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deployments]);

	const openManualRunSettings = useCallback(() => {
		openDrawer(DrawerName.projectManualRunSettings);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const startManualRun = useCallback(async () => {
		if (!projectId) return;
		try {
			setSavingManualRun(true);
			const { data: sessionId, error } = await saveProjectManualRun(projectId);
			if (error) {
				addToast({
					message: t("manualRun.executionFailed"),
					type: "error",
				});
				LoggerService.error(
					namespaces.sessionsService,
					`${t("manualRun.executionFailedExtended", { projectId, error })}`
				);

				return;
			}
			addToast({
				message: (
					<ManualRunSuccessToastMessage
						deploymentId={lastDeploymentStore?.deploymentId}
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
			setSavingManualRun(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Frame className="my-2 bg-gray-1100">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h1 className="text-base">
						{t("tableTitle")} ({deployments?.length || 0})
					</h1>

					<RefreshButton
						isLoading={loadingDeployments}
						onRefresh={() => fetchDeployments(projectId!, true)}
					/>
				</div>

				<div className="relative flex h-9 gap-1.5 rounded-3xl border border-gray-750 p-1 transition hover:border-white">
					<Button
						ariaLabel={t("ariaSettingsRun")}
						className="group h-full whitespace-nowrap hover:bg-gray-1050 active:bg-black"
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

					<div className="w-0.5 bg-gray-750 transition" />

					<Button
						ariaLabel={t("manual")}
						className="group h-full gap-2 whitespace-nowrap hover:bg-gray-1050 active:bg-black"
						disabled={!isManualRunEnabled || !entrypointFunction?.value || savingManualRun}
						onClick={startManualRun}
						variant="light"
					>
						<IconSvg
							className="stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
							src={!savingManualRun ? RunIcon : Spinner}
						/>

						{t("manual")}
					</Button>
				</div>
			</div>

			{loadingDeployments ? <Loader isCenter size="xl" /> : null}

			{!loadingDeployments && !deployments?.length ? (
				<div className="mt-10 text-center text-xl font-semibold">{t("noDeployments")}</div>
			) : null}

			{!loadingDeployments && !!deployments?.length ? (
				<DeploymentsTableContent
					deployments={deployments}
					updateDeployments={() => fetchDeployments(projectId!, true)}
				/>
			) : null}

			<ManualRunSettingsDrawer onRun={() => fetchDeployments(projectId!)} />
		</Frame>
	);
};
