import React, { useState, useEffect } from "react";
import { TrashIcon, ActionActiveIcon, ActionStoppedIcon } from "@assets/image/icons";
import { IconButton, TBody, THead, Table, Td, Th, Toast, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeploymentState, DeploymentSessionStats } from "@components/organisms/deployments";
import { DeploymentStateVariant } from "@enums";
import { SortDirectionVariant } from "@enums/components";
import { DeploymentsService } from "@services";
import { SortDirection } from "@type/components";
import { Deployment } from "@type/models";
import { orderBy } from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

export const DeploymentsHistory = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const [deployments, setDeployments] = useState<Deployment[]>([]);
	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Deployment;
	}>({ direction: SortDirectionVariant.ASC, column: "createdAt" });
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const { projectId } = useParams();
	const navigate = useNavigate();

	const fetchDeployments = async () => {
		if (!projectId) return;

		const { data } = await DeploymentsService.listByProjectId(projectId);
		data && setDeployments(data);
	};

	useEffect(() => {
		fetchDeployments();
	}, [projectId]);

	const toggleSortDeployments = (key: keyof Deployment) => {
		const newDirection =
			sort.column === key && sort.direction === SortDirectionVariant.ASC
				? SortDirectionVariant.DESC
				: SortDirectionVariant.ASC;

		const sortedDeployments = orderBy(deployments, [key], [newDirection]);
		setSort({ direction: newDirection, column: key });
		setDeployments(sortedDeployments);
	};

	const handleActiveDeployment = async (event: React.MouseEvent, id: string) => {
		event.stopPropagation();
		await DeploymentsService.activate(id);
		fetchDeployments();
	};

	const handleStoppedDeployment = async (event: React.MouseEvent, id: string) => {
		event.stopPropagation();
		await DeploymentsService.deactivate(id);
		fetchDeployments();
	};

	const handleRemoveDeployment = async (event: React.MouseEvent, id: string) => {
		event.stopPropagation();
		await DeploymentsService.delete(id);
		fetchDeployments();
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
							<Th className="max-w-12 border-0" />
							<Th className="max-w-12 border-0" />
						</Tr>
					</THead>
					<TBody className="bg-gray-700">
						{deployments.map(({ deploymentId, createdAt, state, buildId, sessionStats }) => (
							<Tr className="group cursor-pointer" key={deploymentId} onClick={() => navigate(deploymentId)}>
								<Td className="font-semibold">{moment(createdAt).fromNow()}</Td>

								<Td>
									<DeploymentSessionStats sessionStats={sessionStats} />
								</Td>
								<Td>{buildId}</Td>
								<Td className="border-r-0">
									<DeploymentState deploymentState={state} />
								</Td>
								<Td className="max-w-12 border-0 pr-1.5 justify-end">
									{state === DeploymentStateVariant.activeDeployment ? (
										<IconButton className="p-1" onClick={(e) => handleStoppedDeployment(e, deploymentId)}>
											<ActionStoppedIcon className="group-hover:fill-white w-4 h-4 transition" />
										</IconButton>
									) : (
										<IconButton className="p-1" onClick={(e) => handleActiveDeployment(e, deploymentId)}>
											<ActionActiveIcon className="group-hover:fill-green-accent w-4 h-4 transition" />
										</IconButton>
									)}
								</Td>
								<Td className="max-w-12 border-0 pr-1.5 justify-end">
									<IconButton onClick={(e) => handleRemoveDeployment(e, deploymentId)}>
										<TrashIcon className="fill-white w-3 h-3" />
									</IconButton>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-black font-semibold text-xl text-center">{t("noDeployments")}</div>
			)}

			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={tErrors("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
