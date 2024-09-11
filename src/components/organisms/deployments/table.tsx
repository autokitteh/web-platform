import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { BuildsService, DeploymentsService, LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { DeploymentStateVariant } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { convertBuildRuntimesToViewTriggers } from "@src/utilities";
import { Deployment } from "@type/models";

import { useDrawerStore, useManualRunStore, useToastStore } from "@store";

import { Button, IconSvg, Loader, Spinner } from "@components/atoms";
import {
	DeploymentsTableContent,
	ManualRunSettingsDrawer,
	ManualRunSuccessToastMessage,
} from "@components/organisms/deployments";

import { RunIcon } from "@assets/image";
import { GearIcon } from "@assets/image/icons";

export const DeploymentsTable = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const addToast = useToastStore((state) => state.addToast);
	const { openDrawer } = useDrawerStore();
	const { projectId } = useParams();

	const [deployments, setDeployments] = useState<Deployment[]>([]);
	const [isLoadingDeployments, setIsLoadingDeployments] = useState(true);
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

	const fetchDeployments = async () => {
		if (!projectId) {
			return;
		}

		const { data, error } = await DeploymentsService.listByProjectId(projectId);
		setIsLoadingDeployments(false);
		if (error) {
			addToast({
				message: (error as Error).message,
				type: "error",
			});

			return;
		}

		if (!data) {
			return;
		}
		setDeployments(data);
	};

	useEffect(() => {
		fetchDeployments();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadSingleshotArgs = async () => {
		if (!deployments.length || !projectId) return;

		const lastDeployment = deployments[0];

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
						sessionId={sessionId}
					/>
				),
				type: "success",
			});
		} finally {
			setSavingManualRun(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return isLoadingDeployments ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="flex w-full flex-col">
			<div className="mt-2 flex items-center justify-between">
				<h1 className="text-base text-black">
					{t("tableTitle")} ({deployments.length})
				</h1>

				<div className="border-1 flex h-10 gap-2 rounded-3xl border border-gray-1000 p-1">
					<Button
						ariaLabel={t("ariaSettingsRun")}
						className="h-full whitespace-nowrap"
						disabled={!isManualRunEnabled}
						onClick={openManualRunSettings}
						title={t("ariaSettingsRun")}
						variant="filledGray"
					>
						<IconSvg className="fill-white" src={GearIcon} />
					</Button>

					<Button
						ariaLabel={t("manual")}
						className="h-full whitespace-nowrap px-3.5"
						disabled={!isManualRunEnabled || !entrypointFunction?.value || savingManualRun}
						onClick={startManualRun}
						variant="filledGray"
					>
						<IconSvg src={!savingManualRun ? RunIcon : Spinner} />

						{t("manual")}
					</Button>
				</div>
			</div>

			{!deployments.length ? (
				<div className="mt-10 text-center text-xl font-semibold text-black">{t("noDeployments")}</div>
			) : (
				<DeploymentsTableContent deployments={deployments} updateDeployments={fetchDeployments} />
			)}

			<ManualRunSettingsDrawer />
		</div>
	);
};
