import React, { useCallback } from "react";
import { AppWrapper } from "@components/templates";
import { useDescope, useSession, useUser } from "@descope/react-sdk";
import axios from "axios";

export const Dashboard = () => {
	const { logout } = useDescope();

	const handleLogout = useCallback(() => {
		logout();
	}, [logout]);

	const { sessionToken } = useSession();
	const { user } = useUser();

	console.log("Logged in!", user);
	console.log("Logged in!", sessionToken);

	axios
		.get(`http://localhost:9980/auth/descope/login?jwt=${sessionToken}`, {})
		.then((response) => {
			console.log("Response", response.data);
		})
		.catch((error) => {
			console.log("Error", error);
		});

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
