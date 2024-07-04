import { ActionActiveIcon, ActionStoppedIcon, TrashIcon } from "@assets/image/icons";
import { IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeleteDeploymentModal } from "@components/organisms/deployments";
import { DeploymentSessionStats, DeploymentState } from "@components/organisms/deployments";
import { fetchDeploymentsInterval } from "@constants";
import { DeploymentStateVariant } from "@enums";
import { ModalName } from "@enums/components";
import { useSort } from "@hooks";
import { DeploymentsService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { Deployment } from "@type/models";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const DeploymentsTable = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const addToast = useToastStore((state) => state.addToast);

	const { closeModal, openModal } = useModalStore();
	const [deployments, setDeployments] = useState<Deployment[]>([]);
	const [deploymentId, setDeploymentId] = useState<string>();
	const [isLoadingDeployments, setIsLoadingDeployments] = useState(true);

	const { projectId } = useParams();
	const navigate = useNavigate();

	const { items: sortedDeployments, requestSort, sortConfig } = useSort<Deployment>(deployments);

	const fetchDeployments = async () => {
		if (!projectId) {
			return;
		}

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
		if (!data) {
			return;
		}
		setDeployments(data);
	};

	useEffect(() => {
		fetchDeployments();

		const deploymentsFetchIntervalId = setInterval(fetchDeployments, fetchDeploymentsInterval);

		return () => clearInterval(deploymentsFetchIntervalId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	if (isLoadingDeployments) {
		return <Loader isCenter size="2xl" />;
	}
	if (!sortedDeployments.length) {
		return <div className="font-semibold mt-10 text-black text-center text-xl">{t("noDeployments")}</div>;
	}

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between">
				<h1 className="text-base text-black">
					{t("tableTitle")} ({deployments.length})
				</h1>
			</div>

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

						<Th className="border-r-0 cursor-pointer font-normal group" onClick={() => requestSort("state")}>
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
											onClick={(e) => handleDeploymentAction(deploymentId, "deactivate", e)}
											title={t("ariaDeactivateDeploy")}
										>
											<ActionStoppedIcon className="group-hover:fill-white h-4 transition w-4" />
										</IconButton>
									) : (
										<IconButton
											ariaLabel={t("ariaActivateDeploy")}
											className="p-1"
											onClick={(e) => handleDeploymentAction(deploymentId, "activate", e)}
										>
											<ActionActiveIcon className="group-hover:fill-green-accent h-4 transition w-4" />
										</IconButton>
									)}

									<IconButton
										ariaLabel={t("ariaDeleteDeploy")}
										disabled={state === DeploymentStateVariant.active}
										onClick={(e) => showDeleteModal(e, deploymentId)}
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
		</div>
	);
};
