import React, { useEffect } from "react";

import { EventsTable } from "../events";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks";
import { EventsDrawerSection } from "@src/interfaces/store/eventsDrawerStore.interface";
import { useEventsDrawerStore } from "@src/store";

import { IconButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EventsList = ({
	isDrawer,
	projectId,
	section,
	connectionId,
	triggerId,
}: {
	connectionId?: string;
	isDrawer?: boolean;
	projectId?: string;
	section?: EventsDrawerSection;
	triggerId?: string;
}) => {
	const { setState, resetState } = useEventsDrawerStore();

	useEffect(() => {
		if (isDrawer) {
			setState({
				connectionId,
				projectId,
				triggerId,
				section,
			});
		}

		return () => {
			if (isDrawer) {
				resetState();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDrawer, connectionId, projectId, triggerId, section]);

	const handleClose = () => {
		if (!isDrawer) return;
		triggerEvent(EventListenerName.hideProjectEventsSidebar);
	};

	return isDrawer ? (
		<Drawer
			className="relative p-0"
			name={DrawerName.events}
			onCloseCallback={handleClose}
			variant="dark"
			wrapperClassName="w-2/3"
		>
			<div className="absolute left-7 top-8 z-10">
				<IconButton className="group h-default-icon w-default-icon bg-gray-700 p-0" onClick={handleClose}>
					<Close className="size-3 fill-white" />
				</IconButton>
			</div>
			<EventsTable />
		</Drawer>
	) : (
		<EventsTable />
	);
};
