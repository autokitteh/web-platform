import React, { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsItemList, ProjectSettingsItem, ProjectSettingsItemAction } from "../projectSettingsItemList";
import { ModalName } from "@enums/components";
import { VariablesService } from "@services";
import { useModalStore, useCacheStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";
import { Variable } from "@src/types/models/variable.type";

import { DeleteVariableModal } from "@components/organisms/variables/deleteModal";

interface ProjectSettingsVariablesProps {
	onOperation: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
}

export const ProjectSettingsVariables = ({ onOperation, validation }: ProjectSettingsVariablesProps) => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "variables" });
	const { t: tVariables } = useTranslation("tabs", { keyPrefix: "variables" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { openModal, closeModal, getModalData } = useModalStore();
	const variables = useCacheStore((state) => state.variables);
	const { projectSettingsAccordionState, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchVariables } = useCacheStore();

	const [isDeletingVariable, setIsDeletingVariable] = useState(false);

	const accordionKey = "variables";
	const isOpen = projectSettingsAccordionState[projectId || ""]?.[accordionKey] || false;

	const handleToggle = useCallback(
		(isOpen: boolean) => {
			if (projectId) {
				setProjectSettingsAccordionState(projectId, accordionKey, isOpen);
			}
		},
		[projectId, setProjectSettingsAccordionState, accordionKey]
	);

	const handleDeleteVariableAsync = useCallback(async () => {
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
	}, [getModalData, projectId, closeModal, addToast, tVariables, fetchVariables]);

	const handleDeleteVariable = useCallback(
		(variableName: string) => {
			onOperation("variable", "delete", variableName);
			openModal(ModalName.deleteVariable, variableName);
		},
		[onOperation, openModal]
	);

	const handleEditVariable = useCallback(
		(variableName: string) => {
			onOperation("variable", "edit", variableName);
			navigate(`variables/${variableName}/edit`);
		},
		[onOperation, navigate]
	);

	const handleAddVariable = useCallback(() => {
		onOperation("variable", "add");
		navigate(`variables/new`);
	}, [onOperation, navigate]);

	const items: ProjectSettingsItem[] = variables.map((variable: Variable) => {
		const hasValue = variable.value && variable.value.trim() !== "";
		return {
			id: variable.name,
			name: variable.name,
			subtitle: variable.value || t("notSet"),
			status: hasValue ? "ok" : "error",
		};
	});

	const actions: ProjectSettingsItemAction[] = [
		{
			type: "edit",
			label: t("actions.edit"),
			onClick: handleEditVariable,
		},
		{
			type: "delete",
			label: t("actions.delete"),
			onClick: handleDeleteVariable,
		},
	];

	const variableName = getModalData<string>(ModalName.deleteVariable);

	return (
		<>
			<ProjectSettingsItemList
				accordionKey={accordionKey}
				actions={actions}
				addButtonLabel="Add"
				emptyStateMessage={t("noVariablesFound")}
				isOpen={isOpen}
				items={items}
				onAdd={handleAddVariable}
				onToggle={handleToggle}
				title={t("title")}
				validation={validation}
			/>
			<DeleteVariableModal
				id={variableName || ""}
				isDeleting={isDeletingVariable}
				onDelete={handleDeleteVariableAsync}
			/>
		</>
	);
};
