import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { EventsTable } from "../events";
import { EventsDrawerProvider } from "@contexts";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks";

import { IconButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EventsList = ({
	fromNavigation,
	isDrawer,
	type,
}: {
	fromNavigation?: boolean;
	isDrawer?: boolean;
	type?: "connections" | "triggers" | "project";
}) => {
	const navigate = useNavigate();
	const { connectionId, projectId, triggerId } = useParams();

	let backRoute = `/projects/${projectId}`;

	if (type !== "project") {
		backRoute = `/projects/${projectId}/${type}`;
	}

	const handleClose = () => {
		if (fromNavigation) {
			navigate(backRoute, { state: { fromEvents: true } });
		} else {
			triggerEvent(EventListenerName.hideProjectEventsSidebar);
		}
	};

	return isDrawer ? (
		<EventsDrawerProvider
			filterType={type}
			isDrawer={isDrawer}
			projectId={projectId}
			sourceId={triggerId || connectionId}
		>
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
