import React, { useEffect, useMemo, useCallback, useState } from "react";
import { PlusCircle } from "@assets/image";
import { EditIcon, TrashIcon } from "@assets/image/icons";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, Toast } from "@components/atoms";
import { SortButton, ConnectionTableState } from "@components/molecules";
import { ModalDeleteConnection } from "@components/organisms/modals";
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
			console.log(connections);
			setConnections(connections);
		} catch (err) {
			setToast({ isOpen: true, message: (err as Error).message });
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchConnections();
	}, []);

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

	return isLoading ? (
		<div className="font-semibold text-xl text-center flex flex-col h-full justify-center">
			{t("buttons.loading")}...
		</div>
	) : (
		<div className="pt-14">
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>
				<Button
					className="w-auto group gap-1 p-0 capitalize font-semibold text-gray-300 hover:text-white"
					href="add-new-connection"
				>
					<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
					{t("buttons.addNew")}
				</Button>
			</div>
			{connections.length ? (
				<Table className="mt-5">
					<THead>
						<Tr>
							<Th className="cursor-pointer group font-normal" onClick={() => toggleSortConnections("name")}>
								{t("table.columns.name")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="cursor-pointer group font-normal" onClick={() => toggleSortConnections("integrationName")}>
								{t("table.columns.app")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"integrationName" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="cursor-pointer group font-normal" onClick={() => toggleSortConnections("status")}>
								{t("table.columns.status")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"status" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="text-right font-normal max-w-20">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>
					<TBody>
						{sortedConnections.map(({ name, integrationName, status, connectionId }) => (
							<Tr className="group" key={connectionId}>
								<Td className="font-semibold">{name}</Td>
								<Td>{integrationName}</Td>
								<Td>
									{status ? <ConnectionTableState connectnionState={status.code} /> : null}
									{status ? <span className="text-xs">{status.message}</span> : null}
								</Td>
								<Td className="max-w-20">
									<div className="flex space-x-1">
										<IconButton ariaLabel={t("table.buttons.ariaModifyConnection", { name })}>
											<EditIcon className="fill-white w-3 h-3" />
										</IconButton>
										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteConnection", { name })}
											onClick={() => handleOpenModalDeleteConnection(connectionId)}
										>
											<TrashIcon className="fill-white w-3 h-3" />
										</IconButton>
									</div>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-gray-300 font-semibold text-xl text-center">{t("titleNoAvailable")}</div>
			)}
			<ModalDeleteConnection connectionId={connectionId} onDelete={handleDeleteConnection} />
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
