import React, { useState, useEffect, useMemo, useCallback } from "react";
import { TrashIcon, ActionActiveIcon, ActionStoppedIcon } from "@assets/image/icons";
import { IconButton, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeploymentState, DeploymentSessionStats } from "@components/organisms/deployments";
import { DeleteDeploymentModal } from "@components/organisms/deployments";
import { fetchDeploymentsInterval } from "@constants";
import { DeploymentStateVariant } from "@enums";
import { ModalName, SortDirectionVariant } from "@enums/components";
import { DeploymentsService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { SortDirection } from "@type/components";
import { Deployment } from "@type/models";
import { orderBy } from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

export const DeploymentsTable = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const addToast = useToastStore((state) => state.addToast);

	const { openModal, closeModal } = useModalStore();
	const [deployments, setDeployments] = useState<Deployment[]>([]);
	const [deploymentId, setDeploymentId] = useState<string>();
	const [isLoadingDeployments, setIsLoadingDeployments] = useState(true);
	const [initialLoad, setInitialLoad] = useState(true);

	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Deployment;
	}>({ direction: SortDirectionVariant.ASC, column: "createdAt" });

	const { projectId } = useParams();
	const navigate = useNavigate();

	const fetchDeployments = async () => {
		if (!projectId) return;

		const { data, error } = await DeploymentsService.listByProjectId(projectId);
		setIsLoadingDeployments(false);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
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
	}, [projectId]);

	const toggleSortDeployments = useCallback(
		(key: keyof Deployment) => {
			const newDirection =
				sort.column === key && sort.direction === SortDirectionVariant.ASC
					? SortDirectionVariant.DESC
					: SortDirectionVariant.ASC;
			setSort({ direction: newDirection, column: key });
		},
		[sort]
	);

	const sortedDeployments = useMemo(() => {
		if (initialLoad) {
			setInitialLoad(false);
			return deployments;
		}
		return orderBy(deployments, [sort.column], [sort.direction]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deployments, sort]);

	const handleDeploymentAction = useCallback(
		async (id: string, action: "activate" | "deactivate" | "delete", event?: React.MouseEvent) => {
			event?.stopPropagation();

			const { error } = await (action === "activate"
				? DeploymentsService.activate(id)
				: action === "deactivate"
					? DeploymentsService.deactivate(id)
					: DeploymentsService.delete(id));

			if (error) {
				addToast({
					id: Date.now().toString(),
					message: (error as Error).message,
					type: "error",
					title: tErrors("error"),
				});
				return;
			}
			if (action === "delete") closeModal(ModalName.deleteDeployment);
			fetchDeployments();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const showDeleteModal = (event: React.MouseEvent, id: string) => {
		event.stopPropagation();
		setDeploymentId(id);
		openModal(ModalName.deleteDeployment);
	};

	if (isLoadingDeployments)
		return <div className="mt-10 text-xl font-semibold text-center text-black">{t("loading")}...</div>;
	if (!sortedDeployments.length)
		return <div className="mt-10 text-xl font-semibold text-center text-black">{t("noDeployments")}</div>;

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between">
				<div className="text-base text-black">
					{t("tableTitle")} ({deployments.length})
				</div>
			</div>
			<Table className="mt-4">
				<THead>
					<Tr>
						<Th className="font-normal cursor-pointer group" onClick={() => toggleSortDeployments("createdAt")}>
							{t("table.columns.deploymentTime")}
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"createdAt" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>

						<Th className="font-normal cursor-pointer group">{t("table.columns.sessions")}</Th>
						<Th className="font-normal cursor-pointer group" onClick={() => toggleSortDeployments("buildId")}>
							{t("table.columns.buildId")}
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"buildId" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="font-normal border-r-0 cursor-pointer group" onClick={() => toggleSortDeployments("state")}>
							{t("table.columns.status")}
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"state" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="font-normal text-right max-w-20">Actions</Th>
					</Tr>
				</THead>
				<TBody className="bg-gray-700">
					{sortedDeployments.map(({ deploymentId, createdAt, state, buildId, sessionStats }) => (
						<Tr
							className="cursor-pointer group"
							key={deploymentId}
							onClick={() => navigate(`${deploymentId}/sessions`)}
						>
							<Td className="font-semibold">{moment(createdAt).fromNow()}</Td>
							<Td>
								<DeploymentSessionStats sessionStats={sessionStats} />
							</Td>
							<Td>{buildId}</Td>
							<Td className="border-r-0">
								<DeploymentState deploymentState={state} />
							</Td>
							<Td className="max-w-20">
								<div className="flex space-x-1">
									{state === DeploymentStateVariant.active ? (
										<IconButton
											ariaLabel={t("ariaDeactivateDeploy")}
											className="p-1"
											onClick={(e) => handleDeploymentAction(deploymentId, "deactivate", e)}
											title={t("ariaDeactivateDeploy")}
										>
											<ActionStoppedIcon className="w-4 h-4 transition group-hover:fill-white" />
										</IconButton>
									) : (
										<IconButton
											ariaLabel={t("ariaActivateDeploy")}
											className="p-1"
											onClick={(e) => handleDeploymentAction(deploymentId, "activate", e)}
										>
											<ActionActiveIcon className="w-4 h-4 transition group-hover:fill-green-accent" />
										</IconButton>
									)}
									<IconButton
										ariaLabel={t("ariaDeleDeploy")}
										disabled={state === DeploymentStateVariant.active}
										onClick={(e) => showDeleteModal(e, deploymentId)}
										title={t("ariaDeleDeploy")}
									>
										<TrashIcon className="w-3 h-3 fill-white" />
									</IconButton>
								</div>
							</Td>
						</Tr>
					))}
				</TBody>
			</Table>
			<DeleteDeploymentModal onDelete={() => handleDeploymentAction(deploymentId!, "delete")} />
		</div>
	);
};
