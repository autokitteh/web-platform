import { Organization, Project, User } from "@src/types/models";
import { ClarityUtils } from "@utilities/clarity.utils";
import { DatadogUtils } from "@utilities/datadog.utils";

export const UserTrackingUtils = {
	setUser: (userId: string, userInfo: User) => {
		ClarityUtils.setUserOnLogin(userId, userInfo.name, userInfo.email);
		DatadogUtils.setUser(userId, userInfo);
	},

	setOrg: (orgId: string, orgInfo: Organization) => {
		ClarityUtils.setOrg(orgInfo);
		DatadogUtils.setOrg(orgId, orgInfo);
	},

	setProject: (projectId: string, projectInfo: Project) => {
		ClarityUtils.setProject(projectId, projectInfo.name);
		DatadogUtils.setProject(projectId, projectInfo);
	},

	setUserRole: (role: string) => {
		ClarityUtils.setUserRole(role);
		DatadogUtils.setUserRole(role);
	},

	setPlanType: (planType: string) => {
		ClarityUtils.setPlanType(planType);
		DatadogUtils.setPlanType(planType);
	},

	setDeploymentId: (deploymentId: string) => {
		ClarityUtils.setDeploymentId(deploymentId);
		DatadogUtils.setDeploymentId(deploymentId);
	},

	trackEvent: (eventName: string, properties?: Record<string, any>) => {
		ClarityUtils.trackEvent(eventName, properties);
		DatadogUtils.trackEvent(eventName, properties);
	},

	setSessionId: (sessionId: string) => {
		ClarityUtils.setSessionId(sessionId);
		DatadogUtils.setSessionId(sessionId);
	},

	setEventId: (eventId: string) => {
		ClarityUtils.setEventId(eventId);
		DatadogUtils.setEventId(eventId);
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
