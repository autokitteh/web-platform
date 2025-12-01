import React, { useCallback, useEffect, useMemo } from "react";

import { useLocation, useParams } from "react-router-dom";

import { DrawerEventsList } from "./drawerEventsList";
import { defaultEventsDrawerWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent, useEventListener, useResize } from "@src/hooks";
import { useEventsDrawerStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";

import { Button, IconSvg, ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";
import { EventViewer } from "@components/organisms/events";

import { ArrowLeft, Close } from "@assets/image/icons";

export const EventsDrawer = () => {
	const location = useLocation();
	const { projectId: projectIdUrlParam } = useParams();
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);
	const setEventsDrawerWidth = useSharedBetweenProjectsStore((state) => state.setEventsDrawerWidth);
	const eventsDrawerWidth = useSharedBetweenProjectsStore((state) => state.eventsDrawerWidth);
	const { setState, resetState, selectedEventId, setSelectedEventId } = useEventsDrawerStore();
	const { addToast } = useToastStore();

	const currentEventsDrawerWidth = useMemo(
		() => eventsDrawerWidth[projectIdUrlParam!] || defaultEventsDrawerWidth.initial,
		[eventsDrawerWidth, projectIdUrlParam]
	);

	const handleResizeChange = useCallback(
		(width: number) => {
			if (projectIdUrlParam) {
				setEventsDrawerWidth(projectIdUrlParam, width);
			}
		},
		[projectIdUrlParam, setEventsDrawerWidth]
	);

	const [drawerWidth] = useResize({
		direction: "horizontal",
		min: defaultEventsDrawerWidth.min,
		max: defaultEventsDrawerWidth.max,
		initial: currentEventsDrawerWidth,
		value: currentEventsDrawerWidth,
		id: "events-drawer-resize",
		onChange: handleResizeChange,
		invertDirection: true,
	});

	const open = (event: CustomEvent<{ connectionId?: string; projectId?: string; triggerId?: string }>) => {
		if (!projectIdUrlParam) return;
		const { connectionId, triggerId } = event?.detail || {};
		const section = connectionId ? "connections" : triggerId ? "triggers" : "project";
		setState({
			connectionId,
			triggerId,
			projectId: projectIdUrlParam,
			section,
		});
		openDrawer(projectIdUrlParam, DrawerName.events);
	};

	const close = useCallback(() => {
		if (!projectIdUrlParam) {
			addToast({
				message: "Couldn't close events drawer - no project ID found",
				type: "error",
			});

			return;
		}
		resetState();
		closeDrawer(projectIdUrlParam, DrawerName.events);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectIdUrlParam]);

	useEventListener(EventListenerName.displayProjectEventsSidebar, open);
	useEventListener(EventListenerName.hideProjectEventsSidebar, close);

	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				if (selectedEventId) {
					setSelectedEventId(undefined);
				} else {
					close();
				}
			}
		};

		document.addEventListener("keydown", handleEscapeKey);

		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [close, selectedEventId, setSelectedEventId]);

	if (!location.pathname.startsWith("/projects") || !projectIdUrlParam) {
		return null;
	}

	const handleClose = () => {
		triggerEvent(EventListenerName.hideProjectEventsSidebar);
	};

	const handleBack = () => {
		setSelectedEventId(undefined);
	};

	return (
		<Drawer
			bgClickable
			bgTransparent
			className="overflow-hidden rounded-l-lg bg-gray-1100 px-8 py-3 sm:py-5 md:py-7"
			divId="project-sidebar-events"
			isScreenHeight={false}
			name={DrawerName.events}
			onCloseCallback={handleClose}
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute"
		>
			<div className="absolute right-4 top-2 z-10 flex w-full flex-row justify-between gap-2 rounded-full p-2 px-4 pl-8">
				{selectedEventId ? (
					<Button
						ariaLabel="Back to events list"
						className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
						onClick={handleBack}
					>
						<IconSvg src={ArrowLeft} />
					</Button>
				) : null}
				<Button
					ariaLabel="Close Events"
					className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
					onClick={handleClose}
				>
					<IconSvg className="fill-white" src={Close} />
				</Button>
			</div>
			{selectedEventId ? <EventViewer eventId={selectedEventId} isDrawer /> : <DrawerEventsList />}
			<ResizeButton
				className="absolute left-0 right-auto top-1/2 z-[125] w-2 -translate-y-1/2 cursor-ew-resize px-1 hover:bg-white"
				direction="horizontal"
				id="events-drawer-resize-button"
				resizeId="events-drawer-resize"
			/>
		</Drawer>
	);
};
