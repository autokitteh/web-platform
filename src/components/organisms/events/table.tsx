import React, { KeyboardEvent, MouseEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useEventsDrawer } from "@contexts";
import { ModalName } from "@src/enums/components";
import { useResize, useSort, useEvent } from "@src/hooks";
import { useCacheStore, useEventsDrawerStore, useModalStore, useToastStore } from "@src/store";
import { BaseEvent, Connection } from "@src/types/models";
import { cn } from "@src/utilities";

import { Frame, IconSvg, Loader, ResizeButton, TBody, Table } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { EventViewer } from "@components/organisms/events";
import { TableHeader } from "@components/organisms/events/table/header";
import { NoEventsSelected } from "@components/organisms/events/table/notSelected";
import { RedispatchEventModal } from "@components/organisms/events/table/redispatchEventModal";
import { EventRow } from "@components/organisms/events/table/row";

const Title = ({
	isDrawer,
	section,
	connection,
	displayedEntity = "",
	displayedEntityName = "",
}: {
	connection?: Connection;
	displayedEntity?: string;
	displayedEntityName?: string;
	isDrawer?: boolean;
	section?: string;
}) => {
	if (!isDrawer) return null;
	const logoSrc = section === "connections" ? connection?.logo : undefined;
	return (
		<div className="mt-1 flex w-full flex-row items-center justify-center gap-2 text-center text-xl font-semibold text-white">
			{logoSrc ? <IconSvg alt="icon" className="size-5" src={logoSrc} /> : null}
			Events of {displayedEntity} {displayedEntityName}
		</div>
	);
};

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

	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 90, min: 10, id: resizeId });
	const { items: sortedEvents, requestSort, sortConfig } = useSort<BaseEvent>(events || []);
	const { eventId } = useParams();
	const navigate = useNavigate();
	const {
		section,
		isDrawer,
		projectId,
		connectionId,
		triggerId,
		displayedEntity,
		displayedEntityName,
		connection,
		selectedEventId,
	} = useEventsDrawer();
	const sourceId = connectionId || triggerId;

	const fetchData = useCallback(async () => {
		setIsSourceLoad(true);
		await fetchEvents({ projectId, sourceId });
		setIsSourceLoad(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDrawer, sourceId, connectionId, triggerId, projectId]);

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
			if (!section) return navigate(`/events/${eventId}`);
			setSelectedEventId(eventId);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId, section, eventId]
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

		const tableWrapperClass = cn("mt-16 h-full", {
			"mt-10": isDrawer,
		});

		return (
			<div className={tableWrapperClass}>
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
												onClick={() => calculateEventAddress(event.eventId)}
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

	const viewerDisplayedEventId = selectedEventId || eventId;

	return (
		<div className="flex size-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<span>
						<Title
							connection={connection}
							displayedEntity={displayedEntity}
							displayedEntityName={displayedEntityName}
							isDrawer={isDrawer}
							section={section}
						/>
					</span>
					<div className="absolute right-7 top-8">
						<RefreshButton disabled={loadingEvents} isLoading={loadingEvents} onRefresh={handleRefresh} />
					</div>
					{tableContent}
				</Frame>
			</div>

			<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeId} />

			<div className="flex rounded-2xl bg-black" style={{ width: `${100 - leftSideWidth}%` }}>
				{viewerDisplayedEventId ? (
					<EventViewer eventId={viewerDisplayedEventId} isDrawer={isDrawer} />
				) : (
					<NoEventsSelected />
				)}
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
