import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { DrawerName } from "@src/enums/components";

import { Drawer } from "@components/molecules";

export const EventsDrawer = () => {
	const navigate = useNavigate();

	const [isOpen, setIsOpen] = useState(false);
	useEffect(() => {
		setIsOpen(location.pathname.endsWith("/events"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	const backURL = window.location.pathname.split("/").slice(0, -2).join("/");

	const closeAndNavigate = () => {
		setIsOpen(false);
		setTimeout(() => {
			navigate(backURL);
		}, 300);
	};

	return (
		<Drawer className="p-10" forcedOpen={isOpen} name={DrawerName.events} variant="dark" wrapperClassName="w-2/3">
			<button onClick={closeAndNavigate}>Close</button>
			<div className="flex size-full">
				<div className="h-full w-1/2 bg-blue-500" />
				<div className="h-full w-1/2 bg-green-200" />
			</div>
		</Drawer>
	);
};
