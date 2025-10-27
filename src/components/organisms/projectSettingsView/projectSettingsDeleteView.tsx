import React, { useState } from "react";

import { useParams } from "react-router-dom";

import { ProjectSettingsConnectionDeleteView } from "./connections/projectSettingsConnectionDeleteView";
import { ProjectSettingsTriggerDeleteView } from "./triggers/projectSettingsTriggerDeleteView";
import { ProjectSettingsVariableDeleteView } from "./variables/projectSettingsVariableDeleteView";
import { ModalName } from "@enums/components";
import { fileOperations } from "@src/factories";
import { useCacheStore, useFileStore, useModalStore, useToastStore } from "@src/store";

import { DeleteFileModal } from "@components/organisms/code/deleteModal";

export const ProjectSettingsDeleteView = () => {
	const { projectId } = useParams();
	const { closeModal, getModalData } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useCacheStore();
	const { closeOpenedFile } = useFileStore();

	const [isDeletingFile, setIsDeletingFile] = useState(false);

	const handleDeleteFile = async () => {
		const modalData = getModalData<string>(ModalName.deleteFile);
		if (!modalData || !projectId) return;

		setIsDeletingFile(true);
		const { deleteFile } = fileOperations(projectId);

		try {
			await closeOpenedFile(modalData);
			await deleteFile(modalData);
			await fetchResources(projectId, true);
			setIsDeletingFile(false);
			closeModal(ModalName.deleteFile);

			addToast({
				message: `File "${modalData}" deleted successfully`,
				type: "success",
			});
		} catch (error) {
			setIsDeletingFile(false);
			closeModal(ModalName.deleteFile);

			addToast({
				message: (error as Error).message,
				type: "error",
			});
		}
	};

	const fileId = getModalData<string>(ModalName.deleteFile);

	return (
		<>
			<ProjectSettingsConnectionDeleteView />
			<ProjectSettingsVariableDeleteView />
			<ProjectSettingsTriggerDeleteView />
			<DeleteFileModal id={fileId || ""} isDeleting={isDeletingFile} onDelete={handleDeleteFile} />
		</>
	);
};
