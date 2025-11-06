import React, { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsItemList, ProjectSettingsItem, ProjectSettingsItemAction } from "../projectSettingsItemList";
import { ModalName } from "@enums/components";
import { TriggersService } from "@services";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useCacheStore, useModalStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";

import { DeleteTriggerModal } from "@components/organisms/triggers/deleteModal";

import { EventsFlag } from "@assets/image/icons";

interface ProjectSettingsTriggersProps {
	onOperation: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
}

export const ProjectSettingsTriggers = ({ onOperation, validation }: ProjectSettingsTriggersProps) => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "triggers" });
	const { t: tTriggers } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { openModal, closeModal, getModalData } = useModalStore();
	const {
		setShouldReopenProjectSettingsAfterEvents,
		projectSettingsAccordionState,
		setProjectSettingsAccordionState,
	} = useSharedBetweenProjectsStore();
	const triggers = useCacheStore((state) => state.triggers);
	const addToast = useToastStore((state) => state.addToast);
	const { fetchTriggers } = useCacheStore();

	const [isDeletingTrigger, setIsDeletingTrigger] = useState(false);

	const accordionKey = "triggers";
	const isOpen = projectSettingsAccordionState[projectId || ""]?.[accordionKey] || false;

	const handleToggle = useCallback(
		(isOpen: boolean) => {
			if (projectId) {
				setProjectSettingsAccordionState(projectId, accordionKey, isOpen);
			}
		},
		[projectId, setProjectSettingsAccordionState, accordionKey]
	);

	const handleDeleteTriggerAsync = useCallback(async () => {
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
			message: tTriggers("table.triggerRemovedSuccessfully"),
			type: "success",
		});

		fetchTriggers(projectId, true);
	}, [getModalData, projectId, closeModal, addToast, tTriggers, fetchTriggers]);

	const handleDeleteTrigger = useCallback(
		(triggerId: string) => {
			onOperation("trigger", "delete", triggerId);
			openModal(ModalName.deleteTrigger, triggerId);
		},
		[onOperation, openModal]
	);

	const handleEditTrigger = useCallback(
		(triggerId: string) => {
			onOperation("trigger", "edit", triggerId);
			navigate(`triggers/${triggerId}/edit`);
		},
		[onOperation, navigate]
	);

	const handleAddTrigger = useCallback(() => {
		onOperation("trigger", "add");
		navigate(`triggers/new`);
	}, [onOperation, navigate]);

	const handleShowEvents = useCallback(
		(triggerId: string) => {
			if (!projectId) return;

			setShouldReopenProjectSettingsAfterEvents(projectId, true);
			triggerEvent(EventListenerName.hideProjectConfigSidebar);
			navigate(`/projects/${projectId}/triggers/${triggerId}/events`);
		},
		[projectId, navigate, setShouldReopenProjectSettingsAfterEvents]
	);

	const items: ProjectSettingsItem[] = (triggers || []).map((trigger) => ({
		id: trigger.triggerId!,
		name: trigger.name || "",
		subtitle: trigger.entrypoint,
	}));

	const actions: ProjectSettingsItemAction[] = [
		{
			type: "edit",
			label: t("actions.edit"),
			onClick: handleEditTrigger,
		},
		{
			type: "custom",
			label: t("actions.showEvents"),
			icon: EventsFlag,
			onClick: handleShowEvents,
		},
		{
			type: "delete",
			label: t("actions.delete"),
			onClick: handleDeleteTrigger,
		},
	];

	const triggerId = getModalData<string>(ModalName.deleteTrigger);

	return (
		<>
			<ProjectSettingsItemList
				accordionKey={accordionKey}
				actions={actions}
				addButtonLabel="Add"
				emptyStateMessage={t("noTriggersFound")}
				isOpen={isOpen}
				items={items}
				onAdd={handleAddTrigger}
				onToggle={handleToggle}
				title={t("title")}
				validation={validation}
			/>
			<DeleteTriggerModal
				id={triggerId || ""}
				isDeleting={isDeletingTrigger}
				onDelete={handleDeleteTriggerAsync}
			/>
		</>
	);
};
