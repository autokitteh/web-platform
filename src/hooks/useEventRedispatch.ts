import { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { DeploymentsService, EventsService, LoggerService } from "../services";
import { namespaces } from "@src/constants";
import { DeploymentStateVariant, EventTypes } from "@src/enums";
import { SelectOption } from "@src/interfaces/components";
import { useProjectStore } from "@src/store";
import { EnrichedEvent } from "@src/types/models";

export const useEventRedispatch = (eventId?: string) => {
	const { t: tErrors } = useTranslation("errors");
	const { t: tEvents } = useTranslation("events");
	const { projectsList } = useProjectStore();
	const [activeDeployment, setActiveDeployment] = useState<string>();
	const [redispatchLoading, setRedispatchLoading] = useState(false);
	const [eventInfo, setEventInfo] = useState<EnrichedEvent>();
	const [eventInfoError, setEventInfoError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

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

	const handleRedispatch = useCallback(async () => {
		if (!eventId) return { success: false, error: tEvents("noEventId") };
		if (!activeDeployment) return { success: false, error: tEvents("noActiveDeployment") };

		try {
			setRedispatchLoading(true);
			const response = await EventsService.redispatch(eventId, activeDeployment);
			if (response.error) {
				throw new Error(tEvents("redispatchFailed"));
			}
			return { success: true, message: tEvents("redispatchSuccess") };
		} catch (error) {
			return { success: false, error: error.message };
		} finally {
			setRedispatchLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId, activeDeployment]);

	const fetchEventInfo = useCallback(async () => {
		setIsLoading(true);
		if (!eventId) {
			setIsLoading(false);
			return;
		}

		const { data: eventInfoRes, error } = await EventsService.getEnriched(eventId);

		if (error) {
			setEventInfoError(tErrors("errorFetchingEvent"));
			setIsLoading(false);
			return;
		}
		if (!eventInfoRes) {
			const errorMessage = tErrors("eventNotFound");
			LoggerService.error(namespaces.ui.eventsViewer, tErrors("eventNotFoundExtended", { eventId, error }));
			setEventInfoError(errorMessage);
			setIsLoading(false);
			return;
		}

		setEventInfo(eventInfoRes);
		setEventInfoError(null);
		setIsLoading(false);
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
		eventInfoError,
		isLoading,
		activeDeployment,
		redispatchLoading,
		projectOptions,
		selectedProject,
		setSelectedProject,
		handleRedispatch,
		handleNavigation,
	};
};
