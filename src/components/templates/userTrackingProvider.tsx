import React from "react";

import { useUserTracking } from "@hooks/useUserTracking";
import { UserTrackingProviderProps } from "@interfaces/components/providers/userTrackingProvider.interface";

export const UserTrackingProvider: React.FC<UserTrackingProviderProps> = ({ children }) => {
	useUserTracking();

	return children;
};
