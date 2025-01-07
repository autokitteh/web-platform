import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { EventsTable } from "../events";
import { DrawerName } from "@src/enums/components";

import { IconButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EventsList = ({ isDrawer }: { isDrawer?: boolean }) => {
	const navigate = useNavigate();
	const { projectId, triggerId } = useParams();

	const closeAndNavigate = () => navigate(`/projects/${projectId}/${triggerId ? "triggers" : "connections"}`);

	return isDrawer ? (
		<Drawer
			className="relative p-0"
			isForcedOpen={true}
			name={DrawerName.events}
			onCloseCallback={closeAndNavigate}
			variant="dark"
			wrapperClassName="w-2/3"
		>
			<div className="absolute left-5 top-2 z-10">
				<IconButton className="group h-default-icon w-default-icon bg-gray-700 p-0" onClick={closeAndNavigate}>
					<Close className="size-3 fill-white" />
				</IconButton>
			</div>
			<EventsTable isDrawer />
		</Drawer>
	) : (
		<EventsTable />
	);
};
