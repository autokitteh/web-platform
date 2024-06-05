import React, { useCallback } from "react";
import { AppWrapper } from "@components/templates";
import { isAuthEnabled } from "@constants";
import { useDescope } from "@descope/react-sdk";
import { useProjectStore, useUserStore } from "@store";

const DashboardContent = ({ userName }: { userName?: string }) => (
	<div className="flex h-full">
		<div className="flex w-full">
			<h1 className="text-black w-full text-2xl font-averta-bold mt-6">Welcome {userName ? `, ${userName}` : null}</h1>
		</div>
	</div>
);

const AuthenticatedDashboard: React.FC = () => {
	const { logout } = useDescope();
	const { reset: resetProjectStore } = useProjectStore();
	const { reset: resetUserStore, user } = useUserStore();

	const userName = user?.name || "";

	const handleLogout = useCallback(() => {
		resetProjectStore();
		resetUserStore();
		logout();
	}, [logout, resetProjectStore, resetUserStore]);

	return (
		<AppWrapper>
			<DashboardContent userName={userName} />
			<button className="text-black" onClick={handleLogout}>
				Logout
			</button>
		</AppWrapper>
	);
};

const UnauthenticatedDashboard: React.FC = () => {
	return (
		<AppWrapper>
			<DashboardContent />
		</AppWrapper>
	);
};

export const Dashboard: React.FC = () => {
	return isAuthEnabled ? <AuthenticatedDashboard /> : <UnauthenticatedDashboard />;
};

export default Dashboard;
