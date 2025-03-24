import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { ConnectionService, LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { Connection } from "@type/models";

import { useSort } from "@hooks";
import { useCacheStore, useConnectionStore, useHasActiveDeployments, useModalStore, useToastStore } from "@store";

import { Button, IconButton, IconSvg, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import {
	ConnectionTableStatus,
	EmptyTableAddButton,
	IdCopyButton,
	PopoverTrigger,
	SortButton,
} from "@components/molecules";
import { PopoverWrapper, PopoverContent } from "@components/molecules/popover/index";
import { ActiveDeploymentWarningModal } from "@components/organisms";
import { DeleteConnectionModal } from "@components/organisms/connections";

import { PlusCircle } from "@assets/image";
import { EditIcon, EventsFlag, InfoIcon, TrashIcon } from "@assets/image/icons";

export const ConnectionsTable = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "connections" });
	const { closeModal, openModal } = useModalStore();
	const { projectId } = useParams();
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);
	const [connectionId, setConnectionId] = useState<string>();
	const addToast = useToastStore((state) => state.addToast);
	const {
		connections,
		fetchConnections,
		loading: { connections: isLoading },
	} = useCacheStore();

	const hasActiveDeployments = useHasActiveDeployments();
	const { items: sortedConnections, requestSort, sortConfig } = useSort<Connection>(connections || [], "name");
	const { resetChecker, setFetchConnectionsCallback } = useConnectionStore();

	const [warningModalAction, setWarningModalAction] = useState<"edit" | "add">();

	const navigateToEditForm = (connectionId: string) => {
		closeModal(ModalName.warningDeploymentActive);
		navigate(`/projects/${projectId}/connections/${connectionId}/edit`);
	};

	const handleAction = (action: "edit" | "add", connectionId: string) => {
		if (hasActiveDeployments) {
			setConnectionId(connectionId);
			setWarningModalAction(action);
			openModal(ModalName.warningDeploymentActive);

			return;
		}

		if (action === "edit") {
			navigateToEditForm(connectionId);

			return;
		}

		navigate("add");
	};

	useEffect(() => {
		setFetchConnectionsCallback(() => fetchConnections(projectId!, true));

		return () => {
			resetChecker();
			setFetchConnectionsCallback(null);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleOpenModalDeleteConnection = useCallback(
		(connectionId: string) => {
			setConnectionId(connectionId);
			openModal(ModalName.deleteConnection);
		},
		[openModal]
	);

	const handleDeleteConnection = async () => {
		if (!connectionId) {
			return;
		}
		setIsDeleting(true);
		const { error } = await ConnectionService.delete(connectionId);
		setIsDeleting(false);
		closeModal(ModalName.deleteConnection);
		if (error) {
			addToast({
				message: tErrors("connectionRemoveFailed"),
				type: "error",
			});

			return;
		}
		setConnectionId(undefined);
		resetChecker();

		const connection = connections?.find((connection) => connection.connectionId === connectionId);

		addToast({
			message: t("connectionRemoveSuccess", { connectionName: connection?.name }),
			type: "success",
		});
		LoggerService.info(namespaces.ui.connections, t("connectionRemoveSuccessWithID", { connectionId }));

		LoggerService.info(
			namespaces.ui.connectionsTable,
			t("connectionRemoveSuccessExtended", { connectionId, connectionName: connection?.name })
		);

		fetchConnections(projectId!, true);
	};

	return isLoading ? (
		<Loader isCenter size="xl" />
	) : (
		<>
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-500">{t("titleAvailable")}</div>

				<Button
					ariaLabel={t("buttons.addNew")}
					className="group w-auto gap-1 p-0 font-semibold capitalize text-gray-500 hover:text-white"
					onClick={() => handleAction("add", "")}
				>
					<PlusCircle className="size-5 stroke-gray-500 duration-300 group-hover:stroke-white" />

					{t("buttons.addNew")}
				</Button>
			</div>
			{connections?.length ? (
				<Table className="mt-2.5">
					<THead>
						<Tr>
							<Th
								className="group w-1/4 cursor-pointer pl-4 font-normal"
								onClick={() => requestSort("name")}
							>
								{t("table.columns.name")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th
								className="group w-1/4 cursor-pointer font-normal"
								onClick={() => requestSort("integrationName")}
							>
								{t("table.columns.app")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"integrationName" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th
								className="group w-4/12 cursor-pointer font-normal"
								onClick={() => requestSort("status")}
							>
								{t("table.columns.status")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"status" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="w-3/12 font-normal">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedConnections.map(
							({ connectionId, integrationName, logo, name, status, statusInfoMessage }, index) => (
								<Tr className="group" key={connectionId}>
									<Td className="w-1/4 pl-4 pr-2 font-semibold">{name}</Td>

									<Td className="w-1/4 pr-2">
										<div className="flex items-center gap-2" title={integrationName}>
											{logo ? (
												<IconSvg
													alt={integrationName}
													className="size-6 shrink-0 rounded-full bg-white p-0.5"
													src={logo}
												/>
											) : null}

											<div className="truncate">{integrationName}</div>
										</div>
									</Td>

									<Td className="w-4/12">
										<div className="inline truncate">
											<ConnectionTableStatus status={status} />: {statusInfoMessage}
										</div>
									</Td>

									<Td className="w-3/12">
										<div className="flex space-x-1">
											<PopoverWrapper animation="slideFromBottom" interactionType="hover">
												<PopoverTrigger>
													<IconButton>
														<IconSvg className="size-4" src={InfoIcon} />
													</IconButton>
												</PopoverTrigger>
												<PopoverContent className="z-40 rounded-lg border-0.5 border-white bg-black p-4">
													<div className="flex flex-col">
														<div className="mb-2 font-semibold">
															{t("table.popover.titleInfo")}
														</div>
														<div className="flex items-center">
															{t("table.popover.connectionId")}:
															<IdCopyButton displayFullLength id={connectionId} />
														</div>
													</div>
												</PopoverContent>
											</PopoverWrapper>
											<IconButton
												ariaLabel={t("table.buttons.titleEditConnection")}
												className="size-8 p-1.5"
												id={index === 0 ? "tourProjectGmailConnectionEdit" : undefined}
												onClick={() => handleAction("edit", connectionId)}
												title={t("table.buttons.titleEditConnection")}
											>
												<EditIcon className="size-3 fill-white" />
											</IconButton>

											<IconButton
												ariaLabel={t("table.buttons.titleRemoveConnection", { name })}
												onClick={() => handleOpenModalDeleteConnection(connectionId)}
												title={t("table.buttons.titleRemoveConnection")}
											>
												<TrashIcon className="size-4 stroke-white" />
											</IconButton>
											<IconButton
												ariaLabel={t("table.buttons.ariaShowTriggerEvents")}
												onClick={() =>
													navigate(
														`/projects/${projectId}/connections/${connectionId}/events`
													)
												}
											>
												<EventsFlag className="size-4 stroke-white" />
											</IconButton>
										</div>
									</Td>
								</Tr>
							)
						)}
					</TBody>
				</Table>
			) : (
				<EmptyTableAddButton buttonText={t("titleEmptyConnections")} onClick={() => navigate("add")} />
			)}
			{connectionId ? (
				<DeleteConnectionModal id={connectionId} isDeleting={isDeleting} onDelete={handleDeleteConnection} />
			) : null}
			<ActiveDeploymentWarningModal
				action={warningModalAction}
				goToAdd={() => navigate("add")}
				goToEdit={navigateToEditForm}
				modifiedId={connectionId || ""}
			/>
		</>
	);
};
