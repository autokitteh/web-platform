import React, { useCallback, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { VariablesSectionList } from "../variablesSectionList";
import { DeleteVariableModal } from "./deleteModal";
import { ModalName } from "@enums/components";
import { VariablesProps, VariableItem, ProjectSettingsItemAction } from "@interfaces/components";
import { VariablesService } from "@services";
import { tourStepsHTMLIds } from "@src/constants";
import { useProjectValidationState } from "@src/hooks";
import { useCacheStore, useModalStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { Variable } from "@src/types/models/variable.type";

import { SettingsIcon, TrashIcon } from "@assets/image/icons";

export const Variables = ({ onOperation, isLoading }: VariablesProps) => {
	const { t } = useTranslation("project-configuration-view", {
		keyPrefix: "variables",
	});
	const { t: tVariables } = useTranslation("tabs", { keyPrefix: "variables" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { openModal, closeModal, getModalData } = useModalStore();
	const variables = useCacheStore((state) => state.variables);
	const { projectSettingsAccordionState, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchVariables } = useCacheStore();

	const [isDeletingVariable, setIsDeletingVariable] = useState(false);
	const variablesValidationStatus = useProjectValidationState("variables", variables);

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
			message: tVariables("variableRemovedSuccessfully", {
				variableName: modalData,
			}),
			type: "success",
		});

		fetchVariables(projectId, true);
	}, [getModalData, projectId, closeModal, addToast, tVariables, fetchVariables]);

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
			onOperation("variable", "delete", variableName);
			openModal(ModalName.deleteVariable, variableName);
		},
		[onOperation, openModal]
	);

	const handleConfigureVariable = useCallback(
		(variableName: string) => {
			onOperation("variable", "edit", variableName);
			navigate(`/projects/${projectId}/explorer/settings/variables/${variableName}/edit`);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId]
	);

	const handleAddVariable = useCallback(() => {
		onOperation("variable", "add");
		navigate(`/projects/${projectId}/explorer/settings/variables/new`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const items: VariableItem[] = variables.map((variable: Variable) => ({
		id: variable.name,
		name: variable.name,
		varValue: variable.value,
		isSecret: variable.isSecret,
	}));

	const actions: ProjectSettingsItemAction = useMemo(
		() => ({
			configure: {
				ariaLabel: t("actions.configure"),
				icon: SettingsIcon,
				label: t("actions.configure"),
				onClick: handleConfigureVariable,
			},
			delete: {
				ariaLabel: t("actions.delete"),
				icon: TrashIcon,
				label: t("actions.delete"),
				onClick: handleDeleteVariable,
			},
		}),
		[t, handleConfigureVariable, handleDeleteVariable]
	);

	const variableName = getModalData<string>(ModalName.deleteVariable);

	return (
		<div className="flex w-full items-start gap-3 rounded-lg transition-all duration-300">
			<VariablesSectionList
				accordionKey={accordionKey}
				actions={actions}
				addButtonLabel="Add"
				emptyStateMessage={t("noVariablesFound")}
				frontendValidationStatus={variablesValidationStatus}
				id={tourStepsHTMLIds.projectVariables}
				isLoading={isLoading}
				isOpen={isOpen}
				items={items}
				onAdd={handleAddVariable}
				onToggle={handleToggle}
				title={t("title")}
			/>
			<DeleteVariableModal
				id={variableName || ""}
				isDeleting={isDeletingVariable}
				onDelete={handleDeleteVariableAsync}
			/>
		</div>
	);
};
