import React, { useCallback, useEffect } from "react";
import { AppWrapper } from "@components/templates";
import { useDescope, useSession, useUser } from "@descope/react-sdk";
import axios from "axios";

export const Dashboard = () => {
	const { logout } = useDescope();
	const { sessionToken } = useSession();
	const { user } = useUser();

	const handleLogout = useCallback(() => {
		logout();
	}, [logout]);

	useEffect(() => {
		if (sessionToken) {
			axios
				.get(`http://localhost:9980/auth/descope/login?jwt=${sessionToken}`, { withCredentials: true })
				.then((response) => {
					console.log("Login Response", response);
					axios
						.post(
							`http://localhost:9980/autokitteh.projects.v1.ProjectsService/ListForOwner`,
							{ ownerId: "" },
							{ withCredentials: true }
						)
						.then((response) => {
							console.log("Project Response", response);
						})
						.catch((error) => {
							console.log("Project Error", error);
						});
				})
				.catch((error) => {
					console.log("Login Error", error);
				});
		}
	}, [sessionToken]);

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
