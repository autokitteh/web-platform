import React, { useState, useEffect } from "react";
import { TBody, THead, Table, Td, Th, Toast, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeploymentState, DeploymentSessionStats } from "@components/organisms/deployments";
import { ESortDirection } from "@enums/components";
import { DeploymentsService } from "@services";
import { TSortDirection } from "@type/components";
import { Deployment } from "@type/models";
import { orderBy } from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const DeploymentsHistory = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const [deployments, setDeployments] = useState<Deployment[]>([]);
	const [sort, setSort] = useState<{
		direction: TSortDirection;
		column: keyof Deployment;
	}>({ direction: ESortDirection.ASC, column: "createdAt" });
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const { projectId } = useParams();

	useEffect(() => {
		if (!projectId) return;

		const fetchDeployments = async () => {
			const { data } = await DeploymentsService.listByProjectId(projectId);
			data && setDeployments(data);
		};
		fetchDeployments();
	}, [projectId]);

	const toggleSortDeployments = (key: keyof Deployment) => {
		const newDirection =
			sort.column === key && sort.direction === ESortDirection.ASC ? ESortDirection.DESC : ESortDirection.ASC;

		const sortedDeployments = orderBy(deployments, [key], [newDirection]);
		setSort({ direction: newDirection, column: key });
		setDeployments(sortedDeployments);
	};

	return (
		<div>
			<div className="flex items-center justify-between">
				<div className="text-base text-black">
					{t("tableTitle")} ({deployments.length})
				</div>
			</div>
			{deployments.length ? (
				<Table className="mt-4">
					<THead>
						<Tr>
							<Th className="cursor-pointer group font-normal" onClick={() => toggleSortDeployments("createdAt")}>
								{t("table.columns.deploymentTime")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"createdAt" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>

							<Th className="cursor-pointer group font-normal">{t("table.columns.sessions")}</Th>
							<Th className="cursor-pointer group font-normal" onClick={() => toggleSortDeployments("buildId")}>
								{t("table.columns.buildId")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"buildId" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th
								className="cursor-pointer group font-normal border-r-0"
								onClick={() => toggleSortDeployments("state")}
							>
								{t("table.columns.status")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"state" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="max-w-10 border-0" />
						</Tr>
					</THead>
					<TBody className="bg-gray-700">
						{deployments.map(({ deploymentId, createdAt, state, buildId, sessionStats }) => (
							<Tr className="group cursor-pointer" key={deploymentId}>
								<Td className="font-semibold">{moment(createdAt).fromNow()}</Td>

								<Td>
									<DeploymentSessionStats sessionStats={sessionStats} />
								</Td>
								<Td>{buildId}</Td>
								<Td className="border-r-0">
									<DeploymentState deploymentState={state} />
								</Td>
								<Td className="max-w-10 border-0 pr-1.5 justify-end" />
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-black font-semibold text-xl text-center">{t("noDeployments")}</div>
			)}

			<Toast
				className="border-error"
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
			>
				<p className="font-semibold text-error">{tErrors("error")}</p>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
