import React, { useCallback, useState } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { DeploymentStateVariant } from "@enums";
import { ModalName } from "@enums/components";
import { DeploymentsService, LoggerService } from "@services";
import { dateTimeFormat, namespaces } from "@src/constants";
import { Deployment } from "@type/models";

import { useSort } from "@hooks";
import { useModalStore, useToastStore } from "@store";

import { IconButton, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeleteDeploymentModal, DeploymentSessionStats, DeploymentState } from "@components/organisms/deployments";

import { ActionActiveIcon, ActionStoppedIcon, TrashIcon } from "@assets/image/icons";

export const DeploymentsTableContent = ({
	deployments,
	updateDeployments,
}: {
	deployments: Deployment[];
	updateDeployments: () => void;
}) => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const navigate = useNavigate();
	const { items: sortedDeployments, requestSort, sortConfig } = useSort<Deployment>(deployments);
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal, openModal } = useModalStore();
	const [deploymentId, setDeploymentId] = useState<string>();
	const [isDeleting, setIsDeleting] = useState(false);

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
					t("deploymentActivatedSuccessfullyExtended", { deploymentId: id })
				);
			} else if (action === "deactivate") {
				addToast({
					message: t("actions.deploymentDeactivatedSuccessfully"),
					type: "success",
				});
				LoggerService.info(
					namespaces.ui.deployments,
					t("deploymentDeactivatedSuccessfullyExtended", { deploymentId: id })
				);
			} else if (action === "delete") {
				closeModal(ModalName.deleteDeployment);

				addToast({
					message: t("actions.deploymentRemovedSuccessfully"),
					type: "success",
				});
				LoggerService.info(
					namespaces.ui.deployments,
					t("deploymentRemovedSuccessfullyExtended", { deploymentId: id })
				);
			}

			updateDeployments();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	return (
		<>
			<Table className="mt-4">
				<THead>
					<Tr>
						<Th
							className="group w-1/5 cursor-pointer pl-4 font-normal"
							onClick={() => requestSort("createdAt")}
						>
							{t("table.columns.deploymentTime")}

							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"createdAt" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th className="group w-1/5 cursor-pointer font-normal">{t("table.columns.sessions")}</Th>

						<Th className="group w-1/5 cursor-pointer font-normal" onClick={() => requestSort("buildId")}>
							{t("table.columns.buildId")}

							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"buildId" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th
							className="group w-1/5 cursor-pointer border-r-0 font-normal"
							onClick={() => requestSort("state")}
						>
							{t("table.columns.status")}

							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"state" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th className="w-1/5 text-right font-normal">{t("table.columns.actions")}</Th>
					</Tr>
				</THead>

				<TBody>
					{sortedDeployments.map(({ buildId, createdAt, deploymentId, sessionStats, state }) => (
						<Tr
							className="group cursor-pointer"
							key={deploymentId}
							onClick={() => navigate(`${deploymentId}/sessions`)}
						>
							<Td className="w-1/5 pl-4 font-semibold">
								{moment(createdAt).local().format(dateTimeFormat)}
							</Td>

							<Td className="w-1/5">
								<DeploymentSessionStats sessionStats={sessionStats} />
							</Td>

							<Td className="w-1/5">{buildId}</Td>

							<Td className="w-1/5 border-r-0">
								<DeploymentState deploymentState={state} />
							</Td>

							<Td className="w-1/5 pr-0">
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
											<ActionStoppedIcon className="size-4 transition group-hover:fill-white" />
										</IconButton>
									) : (
										<IconButton
											ariaLabel={t("ariaActivateDeploy")}
											className="size-8 p-1"
											onClick={(event) => handleDeploymentAction(deploymentId, "activate", event)}
										>
											<ActionActiveIcon className="size-4 transition group-hover:fill-green-800" />
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
