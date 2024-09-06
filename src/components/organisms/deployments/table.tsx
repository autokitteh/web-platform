import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { DeploymentsService } from "@services";
import { DrawerName } from "@src/enums/components";
import { Deployment } from "@type/models";

import { useDrawerStore, useToastStore } from "@store";

import { Button, IconSvg, Loader } from "@components/atoms";
import { DeploymentsTableContent } from "@components/organisms/deployments";
import { ManualRunSettingsDrawer } from "@components/organisms/topbar/project";

import { RunIcon } from "@assets/image";
import { GearIcon } from "@assets/image/icons";

export const DeploymentsTable = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const addToast = useToastStore((state) => state.addToast);
	const { openDrawer } = useDrawerStore();

	const [deployments, setDeployments] = useState<Deployment[]>([]);
	const [isLoadingDeployments, setIsLoadingDeployments] = useState(true);

	const { projectId } = useParams();

	const fetchDeployments = async () => {
		if (!projectId) {
			return;
		}

		const { data, error } = await DeploymentsService.listByProjectId(projectId);
		setIsLoadingDeployments(false);
		if (error) {
			addToast({
				id: Date.now().toString(),
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

	const openManualRunSettings = useCallback(() => {
		openDrawer(DrawerName.projectManualRunSettings);
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
						ariaLabel={t("topbar.buttons.ariaSettingsRun")}
						className="h-full whitespace-nowrap"
						onClick={openManualRunSettings}
						title={t("topbar.buttons.ariaSettingsRun")}
						variant="filledGray"
					>
						<IconSvg className="fill-white" src={GearIcon} />
					</Button>

					<Button ariaLabel={t("manual")} className="h-full whitespace-nowrap px-3.5" variant="filledGray">
						<IconSvg src={RunIcon} />

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
