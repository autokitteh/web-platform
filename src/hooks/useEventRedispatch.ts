import { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { DeploymentsService, EventsService, LoggerService } from "../services";
import { namespaces } from "@src/constants";
import { DeploymentStateVariant, EventTypes } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { useModalStore, useProjectStore, useToastStore } from "@src/store";
import { EnrichedEvent } from "@src/types/models";

export const useEventRedispatch = (eventId: string) => {
	const addToast = useToastStore((state) => state.addToast);
	const { t: tErrors } = useTranslation("errors");
	const { t: tEvents } = useTranslation("events");
	const { projectsList } = useProjectStore();
	const [activeDeployment, setActiveDeployment] = useState<string>();
	const [redispatchLoading, setRedispatchLoading] = useState(false);
	const [eventInfo, setEventInfo] = useState<EnrichedEvent>();
	const { closeModal } = useModalStore();

	const projectOptions = projectsList.map((project) => ({
		label: project.name,
		value: project.id,
	}));

	const [selectedProject, setSelectedProject] = useState<SingleValue<SelectOption>>(projectOptions[0]);

	useEffect(() => {
		const fetchDeployments = async () => {
			const { data: deployments } = await DeploymentsService.list(selectedProject?.value as string);

			if (deployments?.length) {
				const activeDeployment = deployments.find(
					(deployment) => deployment.state === DeploymentStateVariant.active
				);

				setActiveDeployment(activeDeployment?.deploymentId || undefined);

				return;
			}

			setActiveDeployment(undefined);
		};

		fetchDeployments();
	}, [selectedProject]);

	const handleRedispatch = useCallback(
		async () => {
			if (!activeDeployment) return;

			try {
				setRedispatchLoading(true);
				const response = await EventsService.redispatch(eventId, activeDeployment);
				if (response.error) {
					throw new Error();
				}
				addToast({
					message: tEvents("table.redispatchSuccess"),
					type: "success",
				});
			} catch {
				addToast({
					message: tEvents("table.redispatchFailed"),
					type: "error",
				});
			} finally {
				setRedispatchLoading(false);
				closeModal(ModalName.redispatchEvent);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[eventId, activeDeployment]
	);

	const fetchEventInfo = useCallback(async () => {
		if (!eventId) return;
		const { data: eventInfoRes, error } = await EventsService.getEnriched(eventId);

		if (error) {
			addToast({ message: tErrors("errorFetchingEvent"), type: "error" });
			closeModal(ModalName.redispatchEvent);
			return;
		}
		if (!eventInfoRes) {
			addToast({ message: tErrors("eventNotFound"), type: "error" });
			LoggerService.error(namespaces.ui.eventsViewer, tErrors("eventNotFoundExtended", { eventId, error }));

			return;
		}
		setEventInfo(eventInfoRes);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId]);

	useEffect(() => {
		fetchEventInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId]);

	const handleNavigation = () => {
		if (!eventInfo) return;

		const { destinationId, destinationType, projectId } = eventInfo;
		const path = destinationType === EventTypes.trigger ? "triggers" : "connections";

		window.open(`/projects/${projectId}/${path}/${destinationId}/edit`, "_blank");
	};

	return {
		eventInfo,
		activeDeployment,
		redispatchLoading,
		projectOptions,
		selectedProject,
		setSelectedProject,
		handleRedispatch,
		handleNavigation,
	};
};
