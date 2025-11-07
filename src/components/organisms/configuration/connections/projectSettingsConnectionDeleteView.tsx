import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { ConnectionService } from "@services";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";

import { DeleteConnectionModal } from "@components/organisms/connections/deleteModal";

export const ProjectSettingsConnectionDeleteView = () => {
	const { t: tConnections } = useTranslation("tabs", { keyPrefix: "connections" });
	const { projectId } = useParams();
	const { closeModal, getModalData } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchConnections } = useCacheStore();

	const [isDeletingConnection, setIsDeletingConnection] = useState(false);

	const handleDeleteConnection = async () => {
		const modalData = getModalData<string>(ModalName.deleteConnection);
		if (!modalData || !projectId) return;

		setIsDeletingConnection(true);
		const { error } = await ConnectionService.delete(modalData);
		setIsDeletingConnection(false);
		closeModal(ModalName.deleteConnection);

		if (error) {
			return addToast({
				message: (error as Error).message,
				type: "error",
			});
		}

		addToast({
			message: tConnections("connectionRemoveSuccess"),
			type: "success",
		});

		fetchConnections(projectId, true);
	};

	const connectionId = getModalData<string>(ModalName.deleteConnection);

	return (
		<DeleteConnectionModal
			id={connectionId || ""}
			isDeleting={isDeletingConnection}
			onDelete={handleDeleteConnection}
		/>
	);
};
