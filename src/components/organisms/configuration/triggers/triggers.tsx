import React, { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsItemList, ProjectSettingsItem, ProjectSettingsItemAction } from "../configurationItemList";
import { ModalName } from "@enums/components";
import { TriggersService } from "@services";
import { tourStepsHTMLIds } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useCacheStore, useModalStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";

import { DeleteTriggerModal } from "@components/organisms/triggers/deleteModal";

import { TrashIcon, EventsFlag, SettingsBoltIcon } from "@assets/image/icons";

interface TriggersProps {
	onOperation: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
}

export const Triggers = ({ onOperation, validation }: TriggersProps) => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "triggers" });
	const { t: tTriggers } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { openModal, closeModal, getModalData } = useModalStore();
	const {
		projectSettingsAccordionState,
		setProjectSettingsAccordionState,
		setShouldReopenProjectSettingsAfterEvents,
	} = useSharedBetweenProjectsStore();
	const triggers = useCacheStore((state) => state.triggers);
	const addToast = useToastStore((state) => state.addToast);
	const { fetchTriggers } = useCacheStore();

	const [isDeletingTrigger, setIsDeletingTrigger] = useState(false);

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
			navigate(`/projects/${projectId}/explorer/settings/triggers/${triggerId}/edit`);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId]
	);

	const handleAddTrigger = useCallback(() => {
		onOperation("trigger", "add");
		navigate(`/projects/${projectId}/explorer/settings/triggers/new`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const handleShowEvents = useCallback(
		(triggerId: string) => {
			if (!projectId) return;

			setShouldReopenProjectSettingsAfterEvents(projectId, true);
			triggerEvent(EventListenerName.displayProjectEventsSidebar, { triggerId });
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId]
	);

	const items: ProjectSettingsItem[] = (triggers || []).map((trigger) => ({
		id: trigger.triggerId!,
		name: trigger.name || "",
		subtitle: trigger.entrypoint,
	}));

	const actions: ProjectSettingsItemAction = {
		configure: {
			ariaLabel: t("actions.configure"),
			icon: SettingsBoltIcon,
			label: t("actions.configure"),
			onClick: handleEditTrigger,
		},
		custom: {
			ariaLabel: t("actions.showEvents"),
			icon: EventsFlag,
			label: t("actions.showEvents"),
			onClick: handleShowEvents,
		},
		delete: {
			ariaLabel: t("actions.delete"),
			icon: TrashIcon,
			label: t("actions.delete"),
			onClick: handleDeleteTrigger,
		},
	};

	const triggerId = getModalData<string>(ModalName.deleteTrigger);

	return (
		<>
			<ProjectSettingsItemList
				accordionKey={accordionKey}
				actions={actions}
				addButtonLabel="Add"
				emptyStateMessage={t("noTriggersFound")}
				id={tourStepsHTMLIds.projectTriggers}
				isOpen={isOpen}
				items={items}
				onAdd={handleAddTrigger}
				onToggle={handleToggle}
				section="triggers"
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
