import React from "react";

import { ProjectConfigStep } from "./quickstart/projectConfigStep";

import { OauthWaitStep } from "@components/organisms/tour/custom-tours-steps/connections/oauthWaitStep";
import { CodeSettingsStep } from "@components/organisms/tour/custom-tours-steps/quickstart/codeSettingsStep";
import { ManualRunStep } from "@components/organisms/tour/custom-tours-steps/shared/manualRunStep";

export const renderCodeSettingsStep = () => {
	return <CodeSettingsStep />;
};
export const renderManualRunStep = () => {
	return <ManualRunStep />;
};
export const renderOauthWaitStep = () => {
	return <OauthWaitStep />;
};
export const renderProjectConfigAwarenessStep = () => {
	return <ProjectConfigStep />;
};
export const renderProjectConfigActionStep = () => {
	return <ProjectConfigStep />;
};
