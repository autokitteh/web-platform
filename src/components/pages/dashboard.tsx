import React, { useCallback } from "react";
import { AppWrapper } from "@components/templates";
import { useDescope, useUser } from "@descope/react-sdk";

export const Dashboard = () => {
	const { logout } = useDescope();
	const { user } = useUser();

	const handleLogout = useCallback(() => {
		logout();
	}, [logout]);

	return (
		<AppWrapper>
			<h1 className="text-black">Unit Test</h1>
			<p className="text-black">
				{"For " + user.givenName + "s"}
				<br />
				{"Logged in user: " + user.email}
			</p>
			<button className="text-black" onClick={handleLogout}>
				Logout
			</button>
		</AppWrapper>
	);
};
