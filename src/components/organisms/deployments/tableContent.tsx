import React, { useCallback, useState } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { dateTimeFormat, namespaces } from "@constants";
import { DeploymentStateVariant } from "@enums";
import { ModalName } from "@enums/components";
import { DeploymentsService, LoggerService } from "@services";
import { Deployment } from "@type/models";

import { useSort } from "@hooks";
import { useManualRunStore, useModalStore, useToastStore } from "@store";

import { IconButton, StatusBadge, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { IdCopyButton, SortButton } from "@components/molecules";
import { DeleteDeploymentModal, DeploymentSessionStats } from "@components/organisms/deployments";

import { ActionActiveIcon, ActionStoppedIcon, TrashIcon } from "@assets/image/icons";

export const DeploymentsTableContent = ({
	deployments,
	updateDeployments,
}: {
	deployments: Deployment[];
	updateDeployments: () => Promise<void | Deployment[]>;
}) => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const navigate = useNavigate();
	const { projectId } = useParams();
	const { items: sortedDeployments, requestSort, sortConfig } = useSort<Deployment>(deployments);
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal, openModal } = useModalStore();
	const [deploymentId, setDeploymentId] = useState<string>();
	const [isDeleting, setIsDeleting] = useState(false);
	const { t: tSessionsStats } = useTranslation("deployments", { keyPrefix: "sessionStats" });
	const { fetchManualRunConfiguration } = useManualRunStore();

	const showDeleteModal = (event: React.MouseEvent, id: string) => {
		event.stopPropagation();
		setDeploymentId(id);
		openModal(ModalName.deleteDeployment);
	};

	const handleDeploymentAction = useCallback(
		async (id: string, action: "activate" | "deactivate" | "delete", event?: React.MouseEvent) => {
			event?.stopPropagation();

			let error;

			if (action === "activate") {
				const result = await DeploymentsService.activate(id);
				error = result.error;
			} else if (action === "deactivate") {
				const result = await DeploymentsService.deactivate(id);
				error = result.error;
			} else if (action === "delete") {
				setIsDeleting(true);
				const result = await DeploymentsService.delete(id);
				setIsDeleting(false);
				error = result.error;
			}

			if (error) {
				addToast({
					message: (error as Error).message,
					type: "error",
				});

				return;
			}

			if (action === "activate") {
				addToast({
					message: t("actions.deploymentActivatedSuccessfully"),
					type: "success",
				});
				LoggerService.info(
					namespaces.ui.deployments,
					t("actions.deploymentActivatedSuccessfullyExtended", { deploymentId: id })
				);
			} else if (action === "deactivate") {
				addToast({
					message: t("actions.deploymentDeactivatedSuccessfully"),
					type: "success",
				});
				LoggerService.info(
					namespaces.ui.deployments,
					t("actions.deploymentDeactivatedSuccessfullyExtended", { deploymentId: id })
				);
			} else if (action === "delete") {
				closeModal(ModalName.deleteDeployment);

				addToast({
					message: t("actions.deploymentRemovedSuccessfully"),
					type: "success",
				});
				LoggerService.info(
					namespaces.ui.deployments,
					t("actions.deploymentRemovedSuccessfullyExtended", { deploymentId: id })
				);
			}

			await updateDeployments();
			fetchManualRunConfiguration(projectId!);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const goToDeploymentSessions = (id: string) => {
		navigate(`${id}/sessions`);
	};

	return (
		<>
			<Table className="mt-4">
				<THead>
					<Tr>
						<Th
							className="group w-1/8 cursor-pointer pl-4 font-normal"
							onClick={() => requestSort("createdAt")}
						>
							<span className="w-full truncate">{t("table.columns.deploymentTime")}</span>

							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"createdAt" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>
						<Th className="w-1/12" />

						<Th className="group w-1/3 cursor-pointer font-normal">
							<div className="flex w-full gap-1 text-center">
								<div
									aria-label={tSessionsStats("running")}
									className="w-1/4 truncate"
									title={tSessionsStats("running")}
								>
									{t("table.columns.running")}
								</div>
								<div
									aria-label={tSessionsStats("stopped")}
									className="w-1/4 truncate"
									title={tSessionsStats("stopped")}
								>
									{t("table.columns.stopped")}
								</div>
								<div
									aria-label={tSessionsStats("completed")}
									className="w-1/4 truncate"
									title={tSessionsStats("completed")}
								>
									{t("table.columns.completed")}
								</div>
								<div
									aria-label={tSessionsStats("error")}
									className="w-1/4 truncate pr-4"
									title={tSessionsStats("error")}
								>
									{t("table.columns.error")}
								</div>
							</div>
						</Th>
						<Th className="w-1/12" />

						<Th
							className="group w-1/8 cursor-pointer truncate pl-4 font-normal"
							onClick={() => requestSort("buildId")}
						>
							{t("table.columns.buildId")}

							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"buildId" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th
							className="group w-1/8 cursor-pointer truncate border-r-0 font-normal"
							onClick={() => requestSort("state")}
						>
							{t("table.columns.status")}

							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"state" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th className="w-1/8 text-right font-normal">{t("table.columns.actions")}</Th>
					</Tr>
				</THead>

				<TBody>
					{sortedDeployments.map(({ buildId, createdAt, deploymentId, sessionStats, state }) => (
						<Tr
							className="hover:bg-gray-1300"
							key={deploymentId}
							onClick={() => goToDeploymentSessions(deploymentId)}
						>
							<Td className="w-1/8 cursor-pointer pl-4">
								{moment(createdAt).local().format(dateTimeFormat)}
							</Td>
							<Td className="w-1/12" />

							<Td className="w-1/3 cursor-pointer">
								<div className="flex gap-1 pl-2">
									<DeploymentSessionStats deploymentId={deploymentId} sessionStats={sessionStats} />
								</div>
							</Td>
							<Td className="w-1/12" />

							<Td className="w-1/8 pl-4">
								<IdCopyButton id={buildId} />
							</Td>

							<Td className="w-1/8 cursor-pointer border-r-0">
								<StatusBadge deploymentStatus={state} />
							</Td>

							<Td className="w-1/8 pr-0">
								<div className="flex space-x-1">
									{state === DeploymentStateVariant.active ? (
										<IconButton
											ariaLabel={t("ariaDeactivateDeploy")}
											className="size-8 p-1"
											onClick={(event) =>
												handleDeploymentAction(deploymentId, "deactivate", event)
											}
											title={t("ariaDeactivateDeploy")}
										>
											<ActionStoppedIcon className="size-4 transition hover:fill-white" />
										</IconButton>
									) : (
										<IconButton
											ariaLabel={t("ariaActivateDeploy")}
											className="size-8 p-1"
											onClick={(event) => handleDeploymentAction(deploymentId, "activate", event)}
										>
											<ActionActiveIcon className="size-4 transition hover:fill-green-800" />
										</IconButton>
									)}

									<IconButton
										ariaLabel={t("ariaDeleteDeploy")}
										disabled={state === DeploymentStateVariant.active}
										onClick={(event) => showDeleteModal(event, deploymentId)}
										title={t("ariaDeleteDeploy")}
									>
										<TrashIcon className="size-4 stroke-white" />
									</IconButton>
								</div>
							</Td>
						</Tr>
					))}
				</TBody>
			</Table>
			<DeleteDeploymentModal
				id={deploymentId}
				isDeleting={isDeleting}
				onDelete={() => handleDeploymentAction(deploymentId!, "delete")}
			/>
		</>
	);
};
