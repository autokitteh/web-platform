import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsItemList, ProjectSettingsItem, ProjectSettingsItemAction } from "../projectSettingsItemList";
import { ModalName } from "@enums/components";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useCacheStore, useModalStore, useSharedBetweenProjectsStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";

import { EventsFlag, TriggerBoltIcon } from "@assets/image/icons";

interface ProjectSettingsTriggersProps {
	onOperation?: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
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
			if (onOperation) {
				onOperation("trigger", "delete", triggerId);
			} else {
				openModal(ModalName.deleteTrigger, triggerId);
			}
		},
		[onOperation, openModal]
	);

	const handleEditTrigger = useCallback(
		(triggerId: string) => {
			if (onOperation) {
				onOperation("trigger", "edit", triggerId);
			} else {
				navigate(`/projects/${projectId}/triggers/${triggerId}/edit`);
			}
		},
		[onOperation, projectId, navigate]
	);

	const handleAddTrigger = useCallback(() => {
		if (onOperation) {
			onOperation("trigger", "add");
		} else {
			navigate(`/projects/${projectId}/triggers/add`);
		}
	}, [onOperation, projectId, navigate]);

	const handleShowEvents = useCallback(
		(triggerId: string) => {
			if (!projectId) return;

			setShouldReopenProjectSettingsAfterEvents(projectId, true);
			triggerEvent(EventListenerName.hideProjectSettingsSidebar);
			navigate(`/projects/${projectId}/triggers/${triggerId}/events`);
		},

		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId]
	);

	if (triggers.length === 0) {
		return null;
	}

	const items: ProjectSettingsItem[] = triggers.map((trigger) => ({
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
			closeIcon={TriggerBoltIcon}
			isOpen={isOpen}
			items={items}
			onAdd={handleAddTrigger}
			onToggle={handleToggle}
			openIcon={TriggerBoltIcon}
			title={t("title")}
			validation={validation}
		/>
	);
};
