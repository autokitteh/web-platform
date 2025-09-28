import React from "react";

import { ConsentDebugPanel } from "./consentDebugPanel";
import { CookieBanner } from "./cookieBanner";
import { PreferencesModal } from "./preferencesModal";
import { useConsent } from "@src/contexts/consent";

interface ConsentManagerProps {
	className?: string;
}

export const ConsentManager: React.FC<ConsentManagerProps> = ({ className }) => {
	const { isLoaded } = useConsent();

	// Don't render anything until consent system is loaded
	if (!isLoaded) {
		return null;
	}

	return (
		<div className={className}>
			<CookieBanner />
			<PreferencesModal />
			<ConsentDebugPanel />
		</div>
	);
};
