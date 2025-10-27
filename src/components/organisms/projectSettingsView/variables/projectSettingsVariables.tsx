import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsItemList, ProjectSettingsItem, ProjectSettingsItemAction } from "../projectSettingsItemList";
import { ModalName } from "@enums/components";
import { useModalStore, useCacheStore, useSharedBetweenProjectsStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";
import { Variable } from "@src/types/models/variable.type";

import { VariableCodeIcon } from "@assets/image/icons";

interface ProjectSettingsVariablesProps {
	onOperation?: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
}

export const ProjectSettingsVariables = ({ onOperation, validation }: ProjectSettingsVariablesProps) => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "variables" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { openModal } = useModalStore();
	const variables = useCacheStore((state) => state.variables);
	const { projectSettingsAccordionState, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();

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

	const handleDeleteVariable = useCallback(
		(variableName: string) => {
			if (onOperation) {
				onOperation("variable", "delete", variableName);
			} else {
				openModal(ModalName.deleteVariable, variableName);
			}
		},
		[onOperation, openModal]
	);

	const handleEditVariable = useCallback(
		(variableName: string) => {
			if (onOperation) {
				onOperation("variable", "edit", variableName);
			} else {
				navigate(`/projects/${projectId}/variables/edit/${variableName}`);
			}
		},
		[onOperation, projectId, navigate]
	);

	const handleAddVariable = useCallback(() => {
		if (onOperation) {
			onOperation("variable", "add");
		} else {
			navigate(`/projects/${projectId}/variables/add`);
		}
	}, [onOperation, projectId, navigate]);

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

	return (
		<ProjectSettingsItemList
			accordionKey={accordionKey}
			actions={actions}
			addButtonLabel="Add"
			closeIcon={VariableCodeIcon}
			emptyStateMessage={t("noVariablesFound")}
			isOpen={isOpen}
			items={items}
			onAdd={handleAddVariable}
			onToggle={handleToggle}
			openIcon={VariableCodeIcon}
			title={t("title")}
			validation={validation}
		/>
	);
};
