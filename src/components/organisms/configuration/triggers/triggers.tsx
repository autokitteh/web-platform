import React, { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { DeleteTriggerModal } from "./deleteModal";
import { TriggersSectionList } from "./triggersSectionList";
import { ModalName } from "@enums/components";
import { TriggersProps, TriggerItem, ProjectSettingsItemAction } from "@interfaces/components";
import { TriggersService } from "@services";
import { tourStepsHTMLIds } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import {
	useCacheStore,
	useModalStore,
	useSharedBetweenProjectsStore,
	useToastStore,
	useHasActiveDeployments,
} from "@src/store";
import { extractSettingsPath } from "@src/utilities/navigation";

import { ActiveDeploymentWarningModal } from "@components/organisms";

import { TrashIcon, EventsFlag, SettingsIcon } from "@assets/image/icons";

export const Triggers = ({ isLoading }: TriggersProps) => {
	const { t } = useTranslation("project-configuration-view", {
		keyPrefix: "triggers",
	});
	const { t: tTriggers } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { basePath } = extractSettingsPath(location.pathname);
	const { openModal, closeModal, getModalData } = useModalStore();
	const { projectSettingsAccordionState, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();
	const triggers = useCacheStore((state) => state.triggers);
	const addToast = useToastStore((state) => state.addToast);
	const { fetchTriggers } = useCacheStore();
	const hasActiveDeployments = useHasActiveDeployments();

	const [isDeletingTrigger, setIsDeletingTrigger] = useState(false);
	const [warningModalAction, setWarningModalAction] = useState<"add" | "edit" | "delete">();
	const [warningTriggerId, setWarningTriggerId] = useState<string>("");

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
			if (hasActiveDeployments) {
				setWarningTriggerId(triggerId);
				setWarningModalAction("delete");
				openModal(ModalName.warningDeploymentActive);
				return;
			}

			openModal(ModalName.deleteTrigger, triggerId);
		},
		[hasActiveDeployments, openModal]
	);

	const handleEditTrigger = useCallback(
		(triggerId: string) => {
			if (hasActiveDeployments) {
				setWarningTriggerId(triggerId);
				setWarningModalAction("edit");
				openModal(ModalName.warningDeploymentActive);
				return;
			}

			navigate(`${basePath}/settings/triggers/${triggerId}/edit`);
		},
		[hasActiveDeployments, openModal, basePath, navigate]
	);

	const handleAddTrigger = useCallback(() => {
		if (hasActiveDeployments) {
			setWarningModalAction("add");
			openModal(ModalName.warningDeploymentActive);
			return;
		}

		navigate(`${basePath}/settings/triggers/new`);
	}, [hasActiveDeployments, openModal, basePath, navigate]);

	const handleShowEvents = useCallback(
		(triggerId: string) => {
			if (!projectId) return;

			triggerEvent(EventListenerName.displayProjectEventsSidebar, {
				triggerId,
			});
		},

		[projectId]
	);

	const proceedWithAdd = useCallback(() => {
		closeModal(ModalName.warningDeploymentActive);
		navigate(`${basePath}/settings/triggers/new`);
	}, [closeModal, navigate, basePath]);

	const proceedWithEdit = useCallback(
		(triggerId: string) => {
			closeModal(ModalName.warningDeploymentActive);
			navigate(`${basePath}/settings/triggers/${triggerId}/edit`);
		},
		[closeModal, navigate, basePath]
	);

	const proceedWithDelete = useCallback(
		(triggerId: string) => {
			closeModal(ModalName.warningDeploymentActive);
			openModal(ModalName.deleteTrigger, triggerId);
		},
		[closeModal, openModal]
	);

	const items: TriggerItem[] = (triggers || []).map((trigger) => ({
		id: trigger.triggerId!,
		name: trigger.name || "",
		entrypoint: trigger.entrypoint,
		webhookSlug: trigger.webhookSlug,
	}));

	const actions: ProjectSettingsItemAction = {
		configure: {
			ariaLabel: t("actions.configure"),
			icon: SettingsIcon,
			label: t("actions.configure"),
			onClick: handleEditTrigger,
		},
		showEvents: {
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
		<div className="flex w-full items-start rounded-lg transition-all duration-300">
			<TriggersSectionList
				accordionKey={accordionKey}
				actions={actions}
				addButtonLabel="Add"
				emptyStateMessage={t("noTriggersFound")}
				id={tourStepsHTMLIds.projectTriggers}
				isLoading={isLoading}
				isOpen={isOpen}
				items={items}
				onAdd={handleAddTrigger}
				onToggle={handleToggle}
				title={t("title")}
			/>
			<DeleteTriggerModal
				id={triggerId || ""}
				isDeleting={isDeletingTrigger}
				onDelete={handleDeleteTriggerAsync}
			/>
			<ActiveDeploymentWarningModal
				action={warningModalAction === "delete" ? "edit" : warningModalAction}
				goToAdd={proceedWithAdd}
				goToEdit={warningModalAction === "delete" ? proceedWithDelete : proceedWithEdit}
				modifiedId={warningTriggerId}
			/>
		</div>
	);
};
