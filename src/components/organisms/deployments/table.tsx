import React, { useState, useEffect } from "react";
import { Loader } from "@components/atoms";
import { DeploymentsTableContent } from "@components/organisms/deployments";
import { fetchDeploymentsInterval } from "@constants";
import { DeploymentsService } from "@services";
import { useToastStore } from "@store";
import { Deployment } from "@type/models";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const DeploymentsTable = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const addToast = useToastStore((state) => state.addToast);

	const [deployments, setDeployments] = useState<Deployment[]>([]);
	const [isLoadingDeployments, setIsLoadingDeployments] = useState(true);

	const { projectId } = useParams();

	const fetchDeployments = async () => {
		if (!projectId) return;

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
		if (!data) return;
		setDeployments(data);
	};

	useEffect(() => {
		fetchDeployments();

		const deploymentsFetchIntervalId = setInterval(fetchDeployments, fetchDeploymentsInterval);
		return () => clearInterval(deploymentsFetchIntervalId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return isLoadingDeployments ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between">
				<div className="text-base text-black">
					{t("tableTitle")} ({deployments.length})
				</div>
			</div>
			{!deployments.length ? (
				<div className="mt-10 text-xl font-semibold text-center text-black">{t("noDeployments")}</div>
			) : (
				<DeploymentsTableContent deployments={deployments} updateDeployments={fetchDeployments} />
			)}
		</div>
	);
};
