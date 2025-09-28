import { useContext } from "react";

import { ConsentContext } from "./consentContext";
import { ConsentContext as ConsentContextType } from "@src/types/consent.type";

export const useConsent = (): ConsentContextType => {
	const context = useContext(ConsentContext);

	if (!context) {
		throw new Error("useConsent must be used within a ConsentProvider");
	}

	return context;
};
