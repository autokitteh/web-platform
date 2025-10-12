import React from "react";

import { useUserTracking } from "@hooks/useUserTracking";

interface UserTrackingProviderProps {
	children: React.ReactNode;
}

export const UserTrackingProvider: React.FC<UserTrackingProviderProps> = ({ children }) => {
	useUserTracking();

	return children;
};
