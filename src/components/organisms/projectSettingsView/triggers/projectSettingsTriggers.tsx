import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsItemList, ProjectSettingsItem, ProjectSettingsItemAction } from "../projectSettingsItemList";
import { ModalName } from "@enums/components";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useCacheStore, useModalStore, useSharedBetweenProjectsStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";

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
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { openModal } = useModalStore();
	const {
		setShouldReopenProjectSettingsAfterEvents,
		projectSettingsAccordionState,
		setProjectSettingsAccordionState,
	} = useSharedBetweenProjectsStore();
	const triggers = useCacheStore((state) => state.triggers);

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

		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId]
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

	return (
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
	);
};
