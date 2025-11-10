import { Organization, Project, User } from "@src/types/models";
import { DatadogUtils } from "@utilities/datadog.utils";

export const UserTrackingUtils = {
	setUser: (userId: string, userInfo: User) => {
		DatadogUtils.setUser(userId, userInfo);
	},

	setOrg: (orgId: string, orgInfo: Organization) => {
		DatadogUtils.setOrg(orgId, orgInfo);
	},

	setProject: (projectId: string, projectInfo: Project) => {
		DatadogUtils.setProject(projectId, projectInfo);
	},

	setUserRole: (role: string) => {
		DatadogUtils.setUserRole(role);
	},

	setPlanType: (planType: string) => {
		DatadogUtils.setPlanType(planType);
	},

	setDeploymentId: (deploymentId: string) => {
		DatadogUtils.setDeploymentId(deploymentId);
	},

	trackEvent: (eventName: string, properties?: Record<string, any>) => {
		DatadogUtils.trackEvent(eventName, properties);
	},

	setSessionId: (sessionId: string) => {
		DatadogUtils.setSessionId(sessionId);
	},

	setEventId: (eventId: string) => {
		DatadogUtils.setEventId(eventId);
	},

	captureMessage: (
		message: string,
		level: "error" | "warning" | "info" | "debug" = "info",
		context?: Record<string, any>
	) => {
		DatadogUtils.captureMessage(message, level, context);
	},

	captureException: (error: Error | any, context?: Record<string, any>) => {
		DatadogUtils.captureException(error, context);
	},

	captureWarning: (message: string, context?: Record<string, any>) => {
		DatadogUtils.captureWarning(message, context);
	},
};

export const isE2E = () => {
	const urlParams = new URLSearchParams(window.location.search);
	const hasE2eParam = urlParams.get("e2e") === "true";
	const userAgent = navigator.userAgent.toLowerCase();
	const hasHeadless = userAgent.includes("headless");
	const storedE2eFlag = localStorage.getItem("e2e") === "true";
	const isE2eTest = hasE2eParam || hasHeadless || storedE2eFlag;
	return isE2eTest;
};
