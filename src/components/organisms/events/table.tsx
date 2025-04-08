import React, { KeyboardEvent, MouseEvent, useCallback, useEffect, useId, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";
import { AutoSizer, ListRowProps } from "react-virtualized";

import { useEventsDrawer } from "@contexts";
import { IntegrationsService } from "@services";
import { defaultPopoverSelect } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useResize, useSort, useEvent } from "@src/hooks";
import { SelectOption } from "@src/interfaces/components";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";
import { BaseEvent, Deployment, Integration } from "@src/types/models";
import { cn } from "@src/utilities";

import { Frame, Loader, ResizeButton, TBody, Table } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { PopoverSelect } from "@components/molecules/popoverSelect/select";
import { EventViewer } from "@components/organisms/events";
import { TableHeader } from "@components/organisms/events/table/header";
import { NoEventsSelected } from "@components/organisms/events/table/notSelected";
import { RedispatchEventModal } from "@components/organisms/events/table/redispatchEventModal";
import { EventRow } from "@components/organisms/events/table/row";
import { VirtualizedList } from "@components/organisms/events/table/virtualizer";

export const EventsTable = () => {
	const { t } = useTranslation("events");
	const {
		events,
		fetchEvents,
		loading: { events: loadingEvents },
	} = useCacheStore();
	const resizeId = useId();
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [isSourceLoad, setIsSourceLoad] = useState(false);
	const { openModal, closeModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const [selectedEventId, setSelectedEventId] = useState<string>();
	const [selectedPopoverProject, setSelectedPopoverProject] = useState<SingleValue<SelectOption> | null>(null);
	const [selectedPopoverIntegration, setSelectedPopoverIntegration] = useState<string | undefined>(undefined);
	const [integrations, setIntegrations] = useState<Integration[]>([]);

	const {
		eventInfo,
		eventInfoError,
		activeDeployment,
		redispatchLoading,
		projectOptions,
		selectedProject,
		setSelectedProject,
		handleRedispatch,
	} = useEvent(selectedEventId);

	const fetchIntegrations = useCallback(async () => {
		const { data: integrations, error } = await IntegrationsService.list();

		if (error) {
			addToast({
				message: t("intergrationsNotFound"),
				type: "error",
			});
			return;
		}

		setIntegrations(integrations || []);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		fetchIntegrations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 90, min: 10, id: resizeId });
	const { items: sortedEvents, requestSort, sortConfig } = useSort<BaseEvent>(events || []);
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { filterType, isDrawer, projectId, sourceId } = useEventsDrawer();

	const fetchData = useCallback(
		async () => {
			setIsSourceLoad(true);
			await fetchEvents(true, selectedPopoverProject?.value || projectId, sourceId, selectedPopoverIntegration);
			setIsSourceLoad(false);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isDrawer, sourceId, projectId, selectedPopoverProject, selectedPopoverIntegration]
	);

	const handleProjectChange = (id: string) => {
		if (id === defaultPopoverSelect) {
			setSelectedPopoverProject(null);
		} else {
			const project = projectOptions.find((p) => p.value === id);
			if (project) {
				setSelectedPopoverProject(project as SingleValue<SelectOption>);
			}
		}
	};

	const handleIntegrationChange = (id: string) => {
		setSelectedPopoverIntegration(id === defaultPopoverSelect ? undefined : id);
	};

	useEffect(() => {
		if (isInitialLoad) {
			setIsInitialLoad(false);
		}

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedProject, selectedPopoverProject, selectedPopoverIntegration]);

	useEffect(() => {
		if (eventInfoError) {
			addToast({ message: eventInfoError, type: "error" });
			closeModal(ModalName.redispatchEvent);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventInfoError]);

	const handleRedispatchSubmit = async () => {
		const { success, message, error } = await handleRedispatch();
		closeModal(ModalName.redispatchEvent);
		if (success) {
			fetchData();
			addToast({ message: message, type: "success" });
			return;
		}
		addToast({ message: error, type: "error" });
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const frameClass = useMemo(() => cn("size-full rounded-r-none bg-gray-1100 pb-3 pl-7 transition-all"), [eventId]);

	const handleSort = useCallback(
		(key: keyof BaseEvent) => (event: MouseEvent | KeyboardEvent) => {
			if (event.type === "click" || (event as KeyboardEvent).key === "Enter") {
				requestSort(key);
			}
		},
		[requestSort]
	);

	const calculateEventAddress = useCallback(
		(eventId: string) => {
			if (!isDrawer) {
				return `/events/${eventId}`;
			}
			if (sourceId) {
				return `/projects/${projectId}/${filterType}/${sourceId}/events/${eventId}`;
			}

			return `/projects/${projectId}/events/${eventId}`;
		},
		[isDrawer, sourceId, projectId, filterType]
	);

	const openRedispatchModal = useCallback(async (eventId: string) => {
		setSelectedEventId(eventId);
		openModal(ModalName.redispatchEvent);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const rowRenderer = useCallback(
		({ index, key, style }: ListRowProps) => {
			const event = sortedEvents[index];
			const eventAddress = calculateEventAddress(event.eventId);

			return (
				<EventRow
					event={event}
					key={key}
					onClick={() => navigate(eventAddress)}
					onRedispatch={async () => openRedispatchModal(event.eventId)}
					style={style}
				/>
			);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isDrawer, sourceId, projectId, sortedEvents, navigate]
	);

	const tableContent = useMemo(() => {
		if ((loadingEvents && isInitialLoad) || isSourceLoad) {
			return <Loader isCenter size="xl" />;
		}

		if (!loadingEvents && !sortedEvents?.length) {
			return <div className="mt-10 text-center text-xl font-semibold">{t("history.noEvents")}</div>;
		}

		return (
			<div className="mt-2 h-full">
				<Table className="relative w-full overflow-visible">
					<TableHeader onSort={handleSort} sortConfig={sortConfig} />
					<TBody>
						<div className="h-[calc(100vh-200px)]">
							<AutoSizer>
								{({ height, width }) => (
									<VirtualizedList
										height={height}
										rowRenderer={rowRenderer}
										sortedEvents={sortedEvents}
										width={width}
									/>
								)}
							</AutoSizer>
						</div>
					</TBody>
				</Table>
			</div>
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInitialLoad, sortedEvents, isSourceLoad]);

	const handleRefresh = useCallback(
		() =>
			fetchEvents(
				true,
				selectedPopoverProject?.value || sourceId,
				projectId,
				selectedPopoverIntegration
			) as Promise<void | Deployment[]>,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedPopoverProject, selectedPopoverIntegration]
	);

	return (
		<div className="flex size-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="mb-4 flex items-center justify-between">
						<div className="flex w-full items-center gap-4">
							<div className="w-full max-w-64">
								<PopoverSelect
									ariaLabel={t("selects.selectProject")}
									defaultSelectedItem={defaultPopoverSelect}
									emptyListMessage={t("selects.noProjects")}
									items={projectOptions.map((option) => ({
										id: option.value,
										label: option.label,
									}))}
									label={t("selects.projectName")}
									onItemSelected={handleProjectChange}
								/>
							</div>
							<div className="w-full max-w-64">
								<PopoverSelect
									ariaLabel={t("selects.selectIntegration")}
									defaultSelectedItem={defaultPopoverSelect}
									emptyListMessage={t("selects.noIntegrations")}
									items={integrations.map((option) => ({
										id: option.integrationId,
										label: option.displayName,
										icon: option.icon,
									}))}
									label={t("selects.integration")}
									onItemSelected={handleIntegrationChange}
								/>
							</div>
						</div>

						<RefreshButton isLoading={loadingEvents} onRefresh={handleRefresh} />
					</div>
					{tableContent}
				</Frame>
			</div>

			<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeId} />

			<div className="flex rounded-2xl bg-black" style={{ width: `${100 - leftSideWidth}%` }}>
				{eventId ? <EventViewer /> : <NoEventsSelected />}
			</div>
			<RedispatchEventModal
				activeDeployment={activeDeployment}
				eventInfo={eventInfo}
				isLoading={redispatchLoading}
				onProjectChange={setSelectedProject}
				onSubmit={handleRedispatchSubmit}
				projectOptions={projectOptions}
				selectedProject={selectedProject}
			/>
		</div>
	);
};
