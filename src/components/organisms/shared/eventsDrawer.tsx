import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { EventsTable } from "../events";
import { DrawerName } from "@src/enums/components";

import { IconButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EventsDrawer = () => {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const { projectId, triggerId } = useParams();

	useEffect(() => {
		setIsOpen(location.pathname.includes("/events"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	const closeAndNavigate = () => {
		setIsOpen(false);
		setTimeout(() => {
			navigate(`/projects/${projectId}/${triggerId ? "triggers" : "connections"}`);
		}, 500);
	};

	return (
		<Drawer
			className="relative p-0"
			forcedClose={closeAndNavigate}
			forcedOpen={isOpen}
			name={DrawerName.events}
			variant="dark"
			wrapperClassName="w-2/3"
		>
			<div className="absolute left-5 top-2 z-10">
				<IconButton className="group h-default-icon w-default-icon bg-gray-700 p-0" onClick={closeAndNavigate}>
					<Close className="size-3 fill-white" />
				</IconButton>
			</div>

			<EventsTable />
		</Drawer>
	);
};
