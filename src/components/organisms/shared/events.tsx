import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { EventsTable } from "../events";
import { EventsDrawerProvider } from "@contexts";
import { DrawerName } from "@src/enums/components";
import { useProjectStore } from "@src/store";

import { IconButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EventsList = ({
	isDrawer,
	type,
}: {
	isDrawer?: boolean;
	type?: "connections" | "triggers" | "project";
}) => {
	const navigate = useNavigate();
	const { connectionId, projectId, triggerId } = useParams();
	const {
		latestOpened: { tab },
	} = useProjectStore();

	let backRoute = `/projects/${projectId}`;

	if (type !== "project") {
		backRoute = `/projects/${projectId}/${type}`;
	} else if (tab) {
		backRoute = `/projects/${projectId}/${tab}`;
	}

	return isDrawer ? (
		<EventsDrawerProvider
			filterType={type}
			isDrawer={isDrawer}
			projectId={projectId}
			sourceId={triggerId || connectionId}
		>
			<Drawer
				className="relative p-0"
				isForcedOpen={true}
				name={DrawerName.events}
				onCloseCallback={() => navigate(backRoute)}
				variant="dark"
				wrapperClassName="w-2/3"
			>
				<div className="absolute left-5 top-2 z-10">
					<IconButton
						className="group h-default-icon w-default-icon bg-gray-700 p-0"
						onClick={() => navigate(backRoute)}
					>
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
