import React from "react";

import { supportEmail } from "@src/constants";

import { QuotaLimitModal } from "@components/organisms/modals/quotaLimitModal";

/**
 * Wrapper component for QuotaLimitModal that provides the necessary props
 * This component integrates the modal with contact support functionality
 */
export const QuotaLimitModalWrapper: React.FC = () => {
	const onContactSupportClick = () => {
		const subject = "Account Quota Limit";
		const body =
			"Hi,\n\nI have reached my account quota limit and would like to discuss my options for increasing it.\n\nThank you.";

		if (window.navigator.userAgent.includes("Electron")) {
			// Handle Electron environment
			const mailtoLink = document.createElement("a");
			mailtoLink.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
			mailtoLink.target = "_blank";
			mailtoLink.click();
		}
	};

	return <QuotaLimitModal onContactSupportClick={onContactSupportClick} />;
};
