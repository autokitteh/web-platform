import React from "react";

import { CodeSettingsStep } from "@components/organisms/tour/custom-tours-steps/onboarding/codeSettingsStep";
import { ManualRunStep } from "@components/organisms/tour/custom-tours-steps/onboarding/manualRunStep";
import { SendGmailMsg } from "@components/organisms/tour/custom-tours-steps/onboarding/sendGmailMsg";

export const renderCodeSettingsStep = () => {
	return <CodeSettingsStep />;
};
export const renderManualRunStep = () => {
	return <ManualRunStep />;
};

export const renderSendEmailMessage = () => {
	return <SendGmailMsg />;
};
