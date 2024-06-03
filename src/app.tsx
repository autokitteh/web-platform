import React, { useCallback } from "react";
import { useUserStore } from "./store/useUserStore";
import { baseUrl, isAuthEnabled } from "@constants";
import { AuthProvider, useSession, useUser, Descope } from "@descope/react-sdk";
import { router } from "@routing/routes";
import { useProjectStore } from "@store";
import { ProjectsMenuList, User } from "@type/models";
import axios from "axios";
import { RouterProvider } from "react-router-dom";

const getAKToken = async (
	sessionJwt: string,
	getLoggedInUser: () => Promise<{ user?: User }>,
	getProjectsList: () => Promise<{ list: ProjectsMenuList }>
) => {
	try {
		await axios.get(`${baseUrl}/auth/descope/login?jwt=${sessionJwt}`, { withCredentials: true });
		await getLoggedInUser();
		await getProjectsList();
	} catch (error) {
		console.error("Error fetching AK token:", error);
	}
};

export const App: React.FC = () => {
	return (
		<AuthProvider projectId="P2gBMthNrBAMwJ4nH5V3rOEvtNw8">
			<AppContainer />
		</AuthProvider>
	);
};

const AppContainer: React.FC = () => {
	const { isAuthenticated, isSessionLoading } = useSession();
	const { getProjectsList } = useProjectStore();
	const { isUserLoading } = useUser();
	const { getLoggedInUser } = useUserStore();

	const handleSuccess = useCallback(
		(e: CustomEvent<any>) => {
			getAKToken(e.detail.sessionJwt, getLoggedInUser, getProjectsList);
		},
		[getLoggedInUser, getProjectsList]
	);

	if (isSessionLoading || isUserLoading) {
		return <p>Loading...</p>;
	}

	return (
		<div>
			{!isAuthenticated && isAuthEnabled ? <Descope flowId="sign-up-or-in" onSuccess={handleSuccess} /> : null}
			{(!isUserLoading && isAuthenticated) || !isAuthEnabled ? <RouterProvider router={router} /> : null}
		</div>
	);
};
