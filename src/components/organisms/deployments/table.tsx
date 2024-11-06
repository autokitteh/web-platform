import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { BuildsService } from "@services";
import { DeploymentStateVariant } from "@src/enums";
import { useCacheStore, useManualRunStore, useToastStore } from "@src/store/";
import { convertBuildRuntimesToViewTriggers } from "@src/utilities";

import { Frame, Loader } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { DeploymentsTableContent } from "@components/organisms/deployments";

export const DeploymentsTable = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const addToast = useToastStore((state) => state.addToast);
	const { projectId } = useParams();
	const {
		deployments,
		fetchDeployments,
		loading: { deployments: loadingDeployments },
	} = useCacheStore();
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	useEffect(() => {
		if (isInitialLoad && !loadingDeployments) {
			setIsInitialLoad(false);
		}
		if (!loadingDeployments) {
			fetchDeployments(projectId!, true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const { lastDeploymentStore, updateManualRunConfiguration } = useManualRunStore((state) => ({
		lastDeploymentStore: state.projectManualRun[projectId!]?.lastDeployment,
		entrypointFunction: state.projectManualRun[projectId!]?.entrypointFunction,
		updateManualRunConfiguration: state.updateManualRunConfiguration,
		saveAndExecuteManualRun: state.saveAndExecuteManualRun,
	}));

	const loadSingleshotArgs = async () => {
		if (!deployments?.length || deployments[0].state !== DeploymentStateVariant.active) {
			updateManualRunConfiguration(projectId!, { isManualRunEnabled: false });

			return;
		}

		const lastDeployment = deployments[0];

		if (lastDeployment.buildId === lastDeploymentStore?.buildId) {
			updateManualRunConfiguration(projectId!, { isManualRunEnabled: true });

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

		updateManualRunConfiguration(projectId!, { files, lastDeployment, isManualRunEnabled: true });
	};

	useEffect(() => {
		loadSingleshotArgs();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deployments]);

	return (
		<Frame className="my-1.5 flex-1 bg-gray-1100">
			<div className="flex items-center justify-between">
				<h1 className="text-base">
					{t("tableTitle")} ({deployments?.length || "0"})
				</h1>

				<RefreshButton isLoading={loadingDeployments} onRefresh={() => fetchDeployments(projectId!, true)} />
			</div>

			{loadingDeployments && isInitialLoad ? <Loader isCenter size="xl" /> : null}

			{!deployments?.length ? (
				<div className="mt-10 text-center text-xl font-semibold">{t("noDeployments")}</div>
			) : null}

			{!isInitialLoad && deployments?.length ? (
				<DeploymentsTableContent
					deployments={deployments}
					updateDeployments={() => fetchDeployments(projectId!, true)}
				/>
			) : null}
		</Frame>
	);
};
