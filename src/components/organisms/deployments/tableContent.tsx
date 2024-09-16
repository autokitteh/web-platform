import React, { useCallback, useState } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { DeploymentStateVariant } from "@enums";
import { ModalName } from "@enums/components";
import { DeploymentsService, LoggerService } from "@services";
import { namespaces } from "@src/constants";
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
	const { t } = useTranslation("deployments");
	const { t: tErrors } = useTranslation("errors");
	const navigate = useNavigate();
	const { items: sortedDeployments, requestSort, sortConfig } = useSort<Deployment>(deployments);
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal, openModal } = useModalStore();
	const [deploymentId, setDeploymentId] = useState<string>();

	const showDeleteModal = (event: React.MouseEvent, id: string) => {
		event.stopPropagation();
		setDeploymentId(id);
		openModal(ModalName.deleteDeployment);
	};

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
					message: tErrors("deploymentActionFailed"),
					type: "error",
				});

				LoggerService.error(
					namespaces.projectUICode,
					tErrors("deploymentActionFailedExtended", { error: (error as Error).message })
				);

				return;
			}
			if (action === "delete") {
				closeModal(ModalName.deleteDeployment);
			}

			addToast({
				message: t("deploymentActionSucceed", { action }),
				type: "success",
			});

			LoggerService.info(namespaces.projectUICode, t("deploymentActionSucceed", { action }));

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
						<Th className="group cursor-pointer font-normal" onClick={() => requestSort("createdAt")}>
							{t("table.columns.deploymentTime")}

							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"createdAt" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th className="group cursor-pointer font-normal">{t("table.columns.sessions")}</Th>

						<Th className="group cursor-pointer font-normal" onClick={() => requestSort("buildId")}>
							{t("table.columns.buildId")}

							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"buildId" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th
							className="group cursor-pointer border-r-0 font-normal"
							onClick={() => requestSort("state")}
						>
							{t("table.columns.status")}

							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"state" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th className="max-w-20 text-right font-normal">Actions</Th>
					</Tr>
				</THead>

				<TBody>
					{sortedDeployments.map(({ buildId, createdAt, deploymentId, sessionStats, state }) => (
						<Tr
							className="group cursor-pointer"
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

							<Td className="max-w-20 pr-0">
								<div className="flex space-x-1">
									{state === DeploymentStateVariant.active ? (
										<IconButton
											ariaLabel={t("ariaDeactivateDeploy")}
											className="p-1"
											onClick={(event) =>
												handleDeploymentAction(deploymentId, "deactivate", event)
											}
											title={t("ariaDeactivateDeploy")}
										>
											<ActionStoppedIcon className="h-4 w-4 transition group-hover:fill-white" />
										</IconButton>
									) : (
										<IconButton
											ariaLabel={t("ariaActivateDeploy")}
											className="p-1"
											onClick={(event) => handleDeploymentAction(deploymentId, "activate", event)}
										>
											<ActionActiveIcon className="h-4 w-4 transition group-hover:fill-green-800" />
										</IconButton>
									)}

									<IconButton
										ariaLabel={t("ariaDeleteDeploy")}
										disabled={state === DeploymentStateVariant.active}
										onClick={(event) => showDeleteModal(event, deploymentId)}
										title={t("ariaDeleteDeploy")}
									>
										<TrashIcon className="h-3 w-3 fill-white" />
									</IconButton>
								</div>
							</Td>
						</Tr>
					))}
				</TBody>
			</Table>
			<DeleteDeploymentModal onDelete={() => handleDeploymentAction(deploymentId!, "delete")} />
		</>
	);
};
