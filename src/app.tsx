import React from "react";
import { useUserStore } from "./store/useUserStore";
import { baseUrl } from "@constants";
import { AuthProvider } from "@descope/react-sdk";
import { useSession, useUser } from "@descope/react-sdk";
import { Descope } from "@descope/react-sdk";
import { router } from "@routing/routes";
import axios from "axios";
import { RouterProvider } from "react-router-dom";

export const App = () => {
	return (
		<AuthProvider projectId="P2gBMthNrBAMwJ4nH5V3rOEvtNw8">
			<AppContainer />
		</AuthProvider>
	);
};

const AppContainer = () => {
	const { isAuthenticated, isSessionLoading } = useSession();
	const { isUserLoading } = useUser();
	const { getLoggedInUser } = useUserStore();

	const getAKToken = async (e: CustomEvent<any>) => {
		axios
			.get(`${baseUrl}/auth/descope/login?jwt=${e.detail.sessionJwt}`, { withCredentials: true })
			.then(() => getLoggedInUser());
	};

	return (
		<div>
			{!isAuthenticated ? <Descope flowId="sign-up-or-in" onSuccess={(e) => getAKToken(e)} /> : null}

			{isSessionLoading || isUserLoading ? <p>Loading...</p> : null}

			{!isUserLoading && isAuthenticated ? <RouterProvider router={router} /> : null}
		</div>
	);
};
