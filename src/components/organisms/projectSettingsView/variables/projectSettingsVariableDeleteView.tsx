import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { VariablesService } from "@services";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";

import { DeleteVariableModal } from "@components/organisms/variables/deleteModal";

export const ProjectSettingsVariableDeleteView = () => {
	const { t: tVariables } = useTranslation("tabs", { keyPrefix: "variables" });
	const { projectId } = useParams();
	const { closeModal, getModalData } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchVariables } = useCacheStore();

	const [isDeletingVariable, setIsDeletingVariable] = useState(false);

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

		fetchVariables(projectId, true);
	};

	const variableId = getModalData<string>(ModalName.deleteVariable);

	return (
		<DeleteVariableModal id={variableId || ""} isDeleting={isDeletingVariable} onDelete={handleDeleteVariable} />
	);
};
