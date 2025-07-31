import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useCacheStore } from "@src/store/";

import { Frame, Loader } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { DeploymentsTableContent } from "@components/organisms/deployments";

export const DeploymentsTable = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const { projectId } = useParams();
	const {
		deployments,
		fetchDeployments,
		loading: { deployments: loadingDeployments },
	} = useCacheStore();
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	useEffect(() => {
		if (isInitialLoad) {
			setIsInitialLoad(false);
		}
		fetchDeployments(projectId!, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return (
		<Frame className="flex-1 bg-gray-1100" divId="deployments-table">
			<div className="flex items-center justify-between">
				<h1 className="text-base">
					{t("tableTitle")} ({deployments?.length || "0"})
				</h1>

				<RefreshButton isLoading={loadingDeployments} onRefresh={() => fetchDeployments(projectId!, true)} />
			</div>

			{loadingDeployments && isInitialLoad ? <Loader isCenter size="xl" /> : null}

			{!loadingDeployments && !isInitialLoad && !deployments?.length ? (
				<div className="mt-10 text-center text-xl font-semibold">{t("noDeployments")}</div>
			) : null}

			{deployments?.length ? (
				<DeploymentsTableContent
					deployments={deployments}
					updateDeployments={() => fetchDeployments(projectId!, true)}
				/>
			) : null}
		</Frame>
	);
};
