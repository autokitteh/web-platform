import React, { KeyboardEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";

import { useEventsDrawer } from "@contexts";
import { ModalName } from "@src/enums/components";
import { useEvent, useSort } from "@src/hooks";
import { useCacheStore, useEventsDrawerStore, useModalStore, useToastStore } from "@src/store";
import { BaseEvent, Connection } from "@src/types/models";
import { cn } from "@src/utilities";

import { Frame, IconSvg, Loader, TBody, Table } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { TableHeader } from "@components/organisms/events/table/header";
import { RedispatchEventModal } from "@components/organisms/events/table/redispatchEventModal";
import { EventRow } from "@components/organisms/events/table/row";

const Title = ({
	section,
	connection,
	displayedEntity = "",
	displayedEntityName = "",
}: {
	connection?: Connection;
	displayedEntity?: string;
	displayedEntityName?: string;
	section?: string;
}) => {
	const logoSrc = section === "connections" ? connection?.logo : undefined;

	return (
		<div className="mt-1 flex w-full flex-row items-center justify-center gap-2 text-center text-xl font-semibold text-white">
			{logoSrc ? <IconSvg alt="icon" className="size-5" src={logoSrc} /> : null}
			Events of {displayedEntity} {displayedEntityName}
		</div>
	);
};

export const DrawerEventsList = () => {
	const { t } = useTranslation("events");
	const {
		events,
		fetchEvents,
		loading: { events: loadingEvents },
	} = useCacheStore();
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [isSourceLoad, setIsSourceLoad] = useState(false);
	const { openModal, closeModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const setSelectedEventId = useEventsDrawerStore((state) => state.setSelectedEventId);
	const [selectedEventIdForModal, setSelectedEventIdForModal] = useState<string>();
	const parentRef = useRef<HTMLDivElement>(null);

	const {
		eventInfo,
		eventInfoError,
		activeDeployment,
		redispatchLoading,
		projectOptions,
		selectedProject,
		setSelectedProject,
		handleRedispatch,
	} = useEvent(selectedEventIdForModal);

	const { items: sortedEvents, requestSort, sortConfig } = useSort<BaseEvent>(events || []);
	const { section, projectId, connectionId, triggerId, displayedEntity, displayedEntityName, connection } =
		useEventsDrawer();
	const sourceId = connectionId || triggerId;

	const fetchData = useCallback(async () => {
		setIsSourceLoad(true);
		await fetchEvents({ projectId, sourceId });
		setIsSourceLoad(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sourceId, connectionId, triggerId, projectId]);

	useEffect(() => {
		if (isInitialLoad) {
			setIsInitialLoad(false);
		}

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	const handleSort = useCallback(
		(key: keyof BaseEvent) => (event: MouseEvent | KeyboardEvent) => {
			if (event.type === "click" || (event as KeyboardEvent).key === "Enter") {
				requestSort(key);
			}
		},
		[requestSort]
	);

	const handleEventClick = useCallback(
		(eventId: string) => {
			setSelectedEventId(eventId);
		},
		[setSelectedEventId]
	);

	const openRedispatchModal = useCallback(async (eventId: string) => {
		setSelectedEventIdForModal(eventId);
		openModal(ModalName.redispatchEvent);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const virtualizer = useVirtualizer({
		count: sortedEvents.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 58, // defaultEventsTableRowHeight
		overscan: 5,
	});

	const tableContent = useMemo(() => {
		if ((loadingEvents && isInitialLoad) || isSourceLoad) {
			return <Loader isCenter size="xl" />;
		}

		if (!loadingEvents && !sortedEvents?.length) {
			return <div className="mt-12 text-center text-xl font-semibold text-white">{t("history.noEvents")}</div>;
		}

		return (
			<div className="mt-10 h-full">
				<Table className="relative w-full overflow-visible">
					<TableHeader onSort={handleSort} sortConfig={sortConfig} />
					<TBody>
						<div className="h-[calc(100vh-200px)] overflow-auto" ref={parentRef}>
							<div
								className="relative w-full"
								style={{
									height: `${virtualizer.getTotalSize()}px`,
								}}
							>
								{virtualizer.getVirtualItems().map((virtualItem) => {
									const event = sortedEvents[virtualItem.index];
									return (
										<div
											className="absolute left-0 top-0 w-full"
											key={virtualItem.key}
											style={{
												height: `${virtualItem.size}px`,
												transform: `translateY(${virtualItem.start}px)`,
											}}
										>
											<EventRow
												event={event}
												key={virtualItem.key}
												onClick={() => handleEventClick(event.eventId)}
												onRedispatch={async () => openRedispatchModal(event.eventId)}
												style={{ height: "100%" }}
											/>
										</div>
									);
								})}
							</div>
						</div>
					</TBody>
				</Table>
			</div>
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInitialLoad, sortedEvents, isSourceLoad, virtualizer.getVirtualItems()]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleRefresh = useCallback(() => fetchEvents({ projectId, sourceId }), [projectId, sourceId]);

	const frameClass = useMemo(() => cn("size-full bg-gray-1100 pb-3 transition-all"), []);

	return (
		<Frame className={frameClass}>
			<Title
				connection={connection}
				displayedEntity={displayedEntity}
				displayedEntityName={displayedEntityName}
				section={section}
			/>
			<div className="absolute right-7 top-8">
				<RefreshButton disabled={loadingEvents} isLoading={loadingEvents} onRefresh={handleRefresh} />
			</div>
			{tableContent}
			<RedispatchEventModal
				activeDeployment={activeDeployment}
				eventInfo={eventInfo}
				isLoading={redispatchLoading}
				onProjectChange={setSelectedProject}
				onSubmit={handleRedispatchSubmit}
				projectOptions={projectOptions}
				selectedProject={selectedProject}
			/>
		</Frame>
	);
};
