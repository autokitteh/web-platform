import React from "react";

import { CodeSettingsStep } from "@components/organisms/tour/custom-tours-steps/quickstart/codeSettingsStep";
import { ManualRunStep } from "@components/organisms/tour/custom-tours-steps/quickstart/manualRunStep";

export const renderCodeSettingsStep = () => {
	return <CodeSettingsStep />;
};
export const renderManualRunStep = () => {
	return <ManualRunStep />;
};
