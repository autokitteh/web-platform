import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { ConnectionService, LoggerService, TriggersService, VariablesService } from "@services";
import { namespaces } from "@src/constants";
import { fileOperations } from "@src/factories";
import { useCacheStore, useFileStore, useModalStore, useToastStore } from "@src/store";

import { DeleteFileModal } from "@components/organisms/code/deleteModal";
import { DeleteConnectionModal } from "@components/organisms/connections/deleteModal";
import { DeleteTriggerModal } from "@components/organisms/triggers/deleteModal";
import { DeleteVariableModal } from "@components/organisms/variables/deleteModal";

export const ProjectConfigDeleteView = () => {
	const { t: tVariables } = useTranslation("tabs", { keyPrefix: "variables" });
	const { t: tConnections } = useTranslation("tabs", { keyPrefix: "connections" });
	const { t: tTriggers } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { projectId } = useParams();
	const { closeModal, getModalData } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchVariables, fetchConnections, fetchTriggers, fetchResources } = useCacheStore();
	const { closeOpenedFile } = useFileStore();

	const [isDeletingVariable, setIsDeletingVariable] = useState(false);
	const [isDeletingConnection, setIsDeletingConnection] = useState(false);
	const [isDeletingTrigger, setIsDeletingTrigger] = useState(false);
	const [isDeletingFile, setIsDeletingFile] = useState(false);

	const handleDeleteVariable = async () => {
		const modalData = getModalData<string>(ModalName.deleteVariable);
		if (!modalData || !projectId) return;

		setIsDeletingVariable(true);
		const { error } = await VariablesService.delete({
			name: modalData,
			scopeId: projectId,
		});
		setIsDeletingVariable(false);
		closeModal(ModalName.deleteVariable);

		if (error) {
			return addToast({
				message: (error as Error).message,
				type: "error",
			});
		}

		addToast({
			message: tVariables("variableRemovedSuccessfully", { variableName: modalData }),
			type: "success",
		});
		LoggerService.info(
			namespaces.ui.variables,
			tVariables("variableRemovedSuccessfullyExtended", {
				variableName: modalData,
				variableId: modalData,
			})
		);

		fetchVariables(projectId, true);
	};

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
			message: tConnections("connectionRemovedSuccessfully"),
			type: "success",
		});
		LoggerService.info(namespaces.ui.connections, tConnections("connectionRemovedSuccessfullyExtended"));

		fetchConnections(projectId, true);
	};

	const handleDeleteTrigger = async () => {
		const modalData = getModalData<string>(ModalName.deleteTrigger);
		if (!modalData || !projectId) return;

		setIsDeletingTrigger(true);
		const { error } = await TriggersService.delete(modalData);
		setIsDeletingTrigger(false);
		closeModal(ModalName.deleteTrigger);

		if (error) {
			return addToast({
				message: (error as Error).message,
				type: "error",
			});
		}

		addToast({
			message: tTriggers("triggerRemovedSuccessfully"),
			type: "success",
		});
		LoggerService.info(namespaces.ui.triggers, tTriggers("triggerRemovedSuccessfullyExtended"));

		fetchTriggers(projectId, true);
	};

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

	const variableId = getModalData<string>(ModalName.deleteVariable);
	const connectionId = getModalData<string>(ModalName.deleteConnection);
	const triggerId = getModalData<string>(ModalName.deleteTrigger);
	const fileId = getModalData<string>(ModalName.deleteFile);

	return (
		<>
			<DeleteVariableModal
				id={variableId || ""}
				isDeleting={isDeletingVariable}
				onDelete={handleDeleteVariable}
			/>
			<DeleteConnectionModal
				id={connectionId || ""}
				isDeleting={isDeletingConnection}
				onDelete={handleDeleteConnection}
			/>
			<DeleteTriggerModal id={triggerId || ""} isDeleting={isDeletingTrigger} onDelete={handleDeleteTrigger} />
			<DeleteFileModal id={fileId || ""} isDeleting={isDeletingFile} onDelete={handleDeleteFile} />
		</>
	);
};
