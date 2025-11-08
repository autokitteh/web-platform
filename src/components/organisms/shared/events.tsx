import React from "react";

import { useParams } from "react-router-dom";

import { EventsTable } from "../events";
import { EventsDrawerProvider } from "@contexts";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks";

import { IconButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EventsList = ({
	isDrawer,
	type,
	sourceId,
}: {
	isDrawer?: boolean;
	sourceId?: string;
	type?: "connections" | "triggers" | "project";
}) => {
	const { projectId } = useParams();

	const handleClose = () => {
		if (!projectId) return;
		triggerEvent(EventListenerName.hideProjectEventsSidebar);
	};

	return isDrawer ? (
		<EventsDrawerProvider filterType={type} isDrawer={isDrawer} projectId={projectId} sourceId={sourceId}>
			<Drawer
				className="relative p-0"
				name={DrawerName.events}
				onCloseCallback={handleClose}
				variant="dark"
				wrapperClassName="w-2/3"
			>
				<div className="absolute left-5 top-2 z-10">
					<IconButton className="group h-default-icon w-default-icon bg-gray-700 p-0" onClick={handleClose}>
						<Close className="size-3 fill-white" />
					</IconButton>
				</div>
				<EventsTable />
			</Drawer>
		</EventsDrawerProvider>
	) : (
		<EventsTable />
	);
};
