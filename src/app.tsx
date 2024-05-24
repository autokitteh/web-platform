import React from "react";
import { useCallback } from "react";
import { AuthProvider } from "@descope/react-sdk";
import { useDescope, useSession, useUser } from "@descope/react-sdk";
import { Descope } from "@descope/react-sdk";

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
		<div
			style={{
				margin: "5vw",
				width: "90vw",
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				justifyContent: "center",
			}}
		>
			{!isAuthenticated ? (
				<Descope
					flowId="sign-up-or-in"
					onError={() => console.log("Could not log in!")}
					onSuccess={() => console.log("Logged in!")}
				/>
			) : null}

			{isSessionLoading || isUserLoading ? <p>Loading...</p> : null}

			{!isUserLoading && isAuthenticated ? <LoggedIn /> : null}
		</div>
	);
};

const LoggedIn = () => {
	const { logout } = useDescope();
	const { user } = useUser();

	const handleLogout = useCallback(() => {
		logout();
	}, [logout]);

	return (
		<>
			<h1 className="text-black">Unit Test</h1>
			<p className="text-black">
				{"For " + user.givenName + "s"}
				<br />
				{"Logged in user: " + user.email}
			</p>
			<button className="text-black" onClick={handleLogout}>
				Logout
			</button>
		</>
	);
};
