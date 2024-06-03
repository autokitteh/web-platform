import React from "react";
import { AppWrapper } from "@components/templates";
import { useDescope } from "@descope/react-sdk";
import { useProjectStore, useUserStore } from "@store";

export const Dashboard = () => {
	const { logout } = useDescope();
	const { user } = useUserStore();
	const { reset: resetProjectStore } = useProjectStore();
	const { reset: resetUserStore } = useUserStore();

	const handleLogout = () => {
		resetProjectStore();
		resetUserStore();
		logout();
	};

	return (
		<AppWrapper>
			<h1 className="text-black">Unit Test</h1>
			<p className="text-black">
				{"For " + user?.name + "s"}
				<br />
				{"Logged in user: " + user?.email}
			</p>
			<button className="text-black" onClick={handleLogout}>
				Logout
			</button>
		</AppWrapper>
	);
};
