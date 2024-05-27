import React, { useEffect, useMemo, useCallback, useState } from "react";
import { PlusCircle } from "@assets/image";
import { TrashIcon, LinkIcon } from "@assets/image/icons";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, Toast } from "@components/atoms";
import { SortButton, ConnectionTableStatus } from "@components/molecules";
import { ModalDeleteConnection } from "@components/organisms/modals";
import { baseUrl } from "@constants";
import { ModalName, SortDirectionVariant } from "@enums/components";
import { ConnectionService } from "@services";
import { useModalStore } from "@store";
import { SortDirection } from "@type/components";
import { Connection } from "@type/models";
import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const ConnectionsContent = () => {
	const { t: tError } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "connections" });
	const { openModal, closeModal } = useModalStore();
	const { projectId } = useParams();

	const [isLoading, setIsLoading] = useState(false);
	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Connection;
	}>({ direction: SortDirectionVariant.ASC, column: "name" });
	const [connections, setConnections] = useState<Connection[]>([]);
	const [connectionId, setConnectionId] = useState<string>();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const fetchConnections = async () => {
		setIsLoading(true);
		try {
			const { data: connections, error } = await ConnectionService.listByProjectId(projectId!);
			if (error) throw error;
			if (!connections) return;

			setConnections(connections);
		} catch (err) {
			setToast({ isOpen: true, message: (err as Error).message });
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchConnections();
	}, [projectId]);

	const toggleSortConnections = (key: keyof Connection) => {
		const newDirection =
			sort.column === key && sort.direction === SortDirectionVariant.ASC
				? SortDirectionVariant.DESC
				: SortDirectionVariant.ASC;
		setSort({ direction: newDirection, column: key });
	};

	const sortedConnections = useMemo(() => {
		return orderBy(connections, [sort.column], [sort.direction]);
	}, [connections, sort.column, sort.direction]);

	const handleOpenModalDeleteConnection = useCallback(
		(connectionId: string) => {
			setConnectionId(connectionId);
			openModal(ModalName.deleteConnection);
		},
		[connectionId]
	);

	const handleDeleteConnection = async () => {
		if (!connectionId) return;

		const { error } = await ConnectionService.delete(connectionId);
		closeModal(ModalName.deleteConnection);
		if (error) {
			setToast({ isOpen: true, message: tError("connectionRemoveFailed") });
			return;
		}
		fetchConnections();
	};

	//Should take us to the ModifyConnectionPage - to initialize it from there (for example for GitHub: PAT/OAuth)
	const handleConnectionInitClick = useCallback((url: string) => {
		window.open(`${baseUrl}/${url}`, "_blank");
	}, []);

	return isLoading ? (
		<div className="flex flex-col justify-center h-full text-xl font-semibold text-center">
			{t("buttons.loading")}...
		</div>
	) : (
		<div className="pt-14">
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>
				<Button
					className="w-auto gap-1 p-0 font-semibold text-gray-300 capitalize group hover:text-white"
					href="add-new-connection"
				>
					<PlusCircle className="w-5 h-5 duration-300 stroke-gray-300 group-hover:stroke-white" />
					{t("buttons.addNew")}
				</Button>
			</div>
			{connections.length ? (
				<Table className="mt-5">
					<THead>
						<Tr>
							<Th className="font-normal cursor-pointer group" onClick={() => toggleSortConnections("name")}>
								{t("table.columns.name")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group" onClick={() => toggleSortConnections("integrationName")}>
								{t("table.columns.app")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"integrationName" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group max-w-32" onClick={() => toggleSortConnections("status")}>
								{t("table.columns.status")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"status" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group">{t("table.columns.information")}</Th>
							<Th className="font-normal text-right max-w-20">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>
					<TBody>
						{sortedConnections.map(({ name, integrationName, status, statusInfoMessage, connectionId, initUrl }) => (
							<Tr className="group" key={connectionId}>
								<Td className="font-semibold">{name}</Td>
								<Td>{integrationName}</Td>
								<Td className="max-w-32">
									<ConnectionTableStatus status={status} />
								</Td>
								<Td>{statusInfoMessage}</Td>
								<Td className="max-w-20">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.titleInitConnection")}
											className="p-1.5"
											onClick={() => handleConnectionInitClick(initUrl)}
											title={t("table.buttons.titleInitConnection")}
										>
											<LinkIcon className="w-4 h-4 fill-white" />
										</IconButton>
										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteConnection", { name })}
											onClick={() => handleOpenModalDeleteConnection(connectionId)}
											title={t("table.buttons.titleRemoveConnection")}
										>
											<TrashIcon className="w-3 h-3 fill-white" />
										</IconButton>
									</div>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-xl font-semibold text-center text-gray-300">{t("titleNoAvailable")}</div>
			)}
			{connectionId ? <ModalDeleteConnection connectionId={connectionId} onDelete={handleDeleteConnection} /> : null}
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={tError("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
