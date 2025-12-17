import React, { useCallback, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { DeleteVariableModal } from "./deleteModal";
import { VariablesSectionList } from "./variablesSectionList";
import { ModalName } from "@enums/components";
import { VariablesProps, VariableItem, ProjectSettingsItemAction } from "@interfaces/components";
import { VariablesService } from "@services";
import { tourStepsHTMLIds } from "@src/constants";
import { useProjectValidationState } from "@src/hooks";
import {
	useCacheStore,
	useModalStore,
	useSharedBetweenProjectsStore,
	useToastStore,
	useHasActiveDeployments,
} from "@src/store";
import { Variable } from "@src/types/models/variable.type";
import { extractSettingsPath } from "@src/utilities/navigation";

import { ActiveDeploymentWarningModal } from "@components/organisms";

import { SettingsIcon, TrashIcon } from "@assets/image/icons";

export const Variables = ({ isLoading }: VariablesProps) => {
	const { t } = useTranslation("projectSettingsSidebar", {
		keyPrefix: "variables",
	});
	const { t: tVariables } = useTranslation("tabs", { keyPrefix: "variables" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { basePath } = extractSettingsPath(location.pathname);
	const { openModal, closeModal, getModalData } = useModalStore();
	const variables = useCacheStore((state) => state.variables);
	const { projectSettingsAccordionState, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchVariables } = useCacheStore();
	const hasActiveDeployments = useHasActiveDeployments();

	const [isDeletingVariable, setIsDeletingVariable] = useState(false);
	const [warningModalAction, setWarningModalAction] = useState<"add" | "edit" | "delete">();
	const [warningVariableName, setWarningVariableName] = useState<string>("");
	const variablesValidationStatus = useProjectValidationState("variables");

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
			if (hasActiveDeployments) {
				setWarningVariableName(variableName);
				setWarningModalAction("delete");
				openModal(ModalName.warningDeploymentActive);
				return;
			}

			openModal(ModalName.deleteVariable, variableName);
		},
		[hasActiveDeployments, openModal]
	);

	const handleConfigureVariable = useCallback(
		(variableName: string) => {
			if (hasActiveDeployments) {
				setWarningVariableName(variableName);
				setWarningModalAction("edit");
				openModal(ModalName.warningDeploymentActive);
				return;
			}

			navigate(`${basePath}/settings/variables/${variableName}/edit`);
		},
		[hasActiveDeployments, openModal, basePath, navigate]
	);

	const handleAddVariable = useCallback(() => {
		if (hasActiveDeployments) {
			setWarningModalAction("add");
			openModal(ModalName.warningDeploymentActive);
			return;
		}

		navigate(`${basePath}/settings/variables/new`);
	}, [hasActiveDeployments, openModal, basePath, navigate]);

	const proceedWithAdd = useCallback(() => {
		closeModal(ModalName.warningDeploymentActive);
		navigate(`${basePath}/settings/variables/new`);
	}, [closeModal, navigate, basePath]);

	const proceedWithEdit = useCallback(
		(variableName: string) => {
			closeModal(ModalName.warningDeploymentActive);
			navigate(`${basePath}/settings/variables/${variableName}/edit`);
		},
		[closeModal, navigate, basePath]
	);

	const proceedWithDelete = useCallback(
		(variableName: string) => {
			closeModal(ModalName.warningDeploymentActive);
			openModal(ModalName.deleteVariable, variableName);
		},
		[closeModal, openModal]
	);

	const items: VariableItem[] = variables.map((variable: Variable) => ({
		description: variable.description,
		id: variable.name,
		isSecret: variable.isSecret,
		name: variable.name,
		varValue: variable.value,
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
		<div className="flex w-full items-start rounded-lg transition-all duration-300">
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
			<ActiveDeploymentWarningModal
				action={warningModalAction === "delete" ? "edit" : warningModalAction}
				goToAdd={proceedWithAdd}
				goToEdit={warningModalAction === "delete" ? proceedWithDelete : proceedWithEdit}
				modifiedId={warningVariableName}
			/>
		</div>
	);
};
