import React from "react";

import { useClarity } from "@hooks/useClarity";

interface ClarityProviderProps {
	children: React.ReactNode;
}

export const ClarityProvider: React.FC<ClarityProviderProps> = ({ children }) => {
	useClarity();

	return children;
};
