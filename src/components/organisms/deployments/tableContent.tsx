import React, { useCallback, useState } from "react";
import { ActionActiveIcon, ActionStoppedIcon, TrashIcon } from "@assets/image/icons";
import { Table, TBody, THead, Th, Tr, Td } from "@components/atoms";
import { IconButton } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeploymentState, DeploymentSessionStats, DeleteDeploymentModal } from "@components/organisms/deployments";
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
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const navigate = useNavigate();
	const { items: sortedDeployments, sortConfig, requestSort } = useSort<Deployment>(deployments);
	const addToast = useToastStore((state) => state.addToast);
	const { openModal, closeModal } = useModalStore();
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
					title: tErrors("error"),
				});
				return;
			}
			if (action === "delete") closeModal(ModalName.deleteDeployment);
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
						<Th className="font-normal cursor-pointer group" onClick={() => requestSort("createdAt")}>
							{t("table.columns.deploymentTime")}
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"createdAt" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>

						<Th className="font-normal cursor-pointer group">{t("table.columns.sessions")}</Th>
						<Th className="font-normal cursor-pointer group" onClick={() => requestSort("buildId")}>
							{t("table.columns.buildId")}
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"buildId" === sortConfig.key}
								sortDirection={sortConfig.direction}
							/>
						</Th>
						<Th className="font-normal border-r-0 cursor-pointer group" onClick={() => requestSort("state")}>
							{t("table.columns.status")}
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"state" === sortConfig.key}
								sortDirection={sortConfig.direction}
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
										ariaLabel={t("ariaDeleteDeploy")}
										disabled={state === DeploymentStateVariant.active}
										onClick={(e) => showDeleteModal(e, deploymentId)}
										title={t("ariaDeleteDeploy")}
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
		</>
	);
};
