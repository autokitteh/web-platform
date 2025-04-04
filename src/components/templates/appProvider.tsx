import React from "react";

import { AppProviderProps } from "@src/interfaces/components";

import { Toast } from "@components/molecules";
import { TourManager } from "@components/organisms";

export const AppProvider = ({ children }: AppProviderProps) => {
	return (
		<>
			{children}
			<Toast />
			<TourManager />
		</>
	);
};
