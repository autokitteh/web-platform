import React from "react";
import { AuthProvider } from "@descope/react-sdk";
import { useSession, useUser } from "@descope/react-sdk";
import { Descope } from "@descope/react-sdk";
import { router } from "@routing/routes";
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

	return (
		<div>
			{!isAuthenticated ? (
				<Descope
					flowId="sign-up-or-in"
					onError={() => console.log("Could not log in!")}
					onSuccess={() => console.log("Logged in!")}
				/>
			) : null}

			{isSessionLoading || isUserLoading ? <p>Loading...</p> : null}

			{!isUserLoading && isAuthenticated ? <RouterProvider router={router} /> : null}
		</div>
	);
};
