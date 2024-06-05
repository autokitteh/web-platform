import React from "react";
import { AppWrapper } from "@components/templates";
import { isAuthEnabled } from "@constants";
import { useDescope } from "@descope/react-sdk";
import { useProjectStore, useUserStore } from "@store";

const AuthenticatedDashboard = () => {
	const descope = useDescope();
	const { reset: resetProjectStore } = useProjectStore();
	const { reset: resetUserStore, user } = useUserStore();

	const handleLogout = () => {
		resetProjectStore();
		resetUserStore();
		descope.logout();
	};

	return (
		<div>
			<h1 className="text-black">Unit Test</h1>
			<p className="text-black">
				For {user ? user?.name : null}
				<br />
				Logged in user: {user ? user?.email : null}
			</p>
			<button className="text-black" onClick={handleLogout}>
				Logout
			</button>
		</div>
	);
};

const UnauthenticatedDashboard = () => {
	return (
		<div>
			<h1 className="text-black">Welcome,</h1>
		</div>
	);
};

export const Dashboard = () => {
	return <AppWrapper>{isAuthEnabled ? <AuthenticatedDashboard /> : <UnauthenticatedDashboard />}</AppWrapper>;
};
