import React, { useCallback, useState } from "react";

import { ActionActiveIcon, ActionStoppedIcon, TrashIcon } from "@assets/image/icons";
import { IconButton, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeleteDeploymentModal, DeploymentSessionStats, DeploymentState } from "@components/organisms/deployments";
import { DeploymentStateVariant } from "@enums";
import { ModalName } from "@enums/components";
import { useSort } from "@hooks";
import { DeploymentsService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { Deployment } from "@type/models";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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
					id: Date.now().toString(),
					message: (error as Error).message,
					type: "error",
				});

				return;
			}
			if (action === "delete") {
				closeModal(ModalName.deleteDeployment);
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
						<Th className="cursor-pointer font-normal group" onClick={() => requestSort("createdAt")}>
							{t("table.columns.deploymentTime")}

							<SortButton
								className="group-hover:opacity-100 opacity-0"
								isActive={"createdAt" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th className="cursor-pointer font-normal group">{t("table.columns.sessions")}</Th>

						<Th className="cursor-pointer font-normal group" onClick={() => requestSort("buildId")}>
							{t("table.columns.buildId")}

							<SortButton
								className="group-hover:opacity-100 opacity-0"
								isActive={"buildId" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th
							className="border-r-0 cursor-pointer font-normal group"
							onClick={() => requestSort("state")}
						>
							{t("table.columns.status")}

							<SortButton
								className="group-hover:opacity-100 opacity-0"
								isActive={"state" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th className="font-normal max-w-20 text-right">Actions</Th>
					</Tr>
				</THead>

				<TBody className="bg-gray-700">
					{sortedDeployments.map(({ buildId, createdAt, deploymentId, sessionStats, state }) => (
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
											onClick={(event) =>
												handleDeploymentAction(deploymentId, "deactivate", event)
											}
											title={t("ariaDeactivateDeploy")}
										>
											<ActionStoppedIcon className="group-hover:fill-white h-4 transition w-4" />
										</IconButton>
									) : (
										<IconButton
											ariaLabel={t("ariaActivateDeploy")}
											className="p-1"
											onClick={(event) => handleDeploymentAction(deploymentId, "activate", event)}
										>
											<ActionActiveIcon className="group-hover:fill-green-accent h-4 transition w-4" />
										</IconButton>
									)}

									<IconButton
										ariaLabel={t("ariaDeleteDeploy")}
										disabled={state === DeploymentStateVariant.active}
										onClick={(event) => showDeleteModal(event, deploymentId)}
										title={t("ariaDeleteDeploy")}
									>
										<TrashIcon className="fill-white h-3 w-3" />
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
