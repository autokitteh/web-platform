import { datadogRum } from "@datadog/browser-rum";
import type { RumInitConfiguration } from "@datadog/browser-rum";
import { reactPlugin } from "@datadog/browser-rum-react";
import { t } from "i18next";

import { LoggerService } from "@services/logger.service";
import { datadogConstants, ddConfigured, namespaces } from "@src/constants";
import { Organization, Project, User } from "@src/types/models";
import { CorrelationIdUtils } from "@src/utilities/correlationId.utils";

let initCalled = false;

const isInitialized = (): boolean => {
	return initCalled && !!window.DD_RUM;
};

const waitForSession = (maxWaitMs: number = 2000): Promise<boolean> => {
	if (!isInitialized()) return Promise.resolve(false);

	return new Promise((resolve) => {
		const startTime = Date.now();
		const checkInterval = 50;

		const checkContext = setInterval(() => {
			try {
				const context = datadogRum.getInternalContext();
				if (context?.session_id) {
					clearInterval(checkContext);
					resolve(true);
					return;
				}
			} catch (error) {
				LoggerService.warn(
					namespaces.datadog,
					t("datadog.errorCheckingSessionContext", { ns: "utilities", error: String(error) }),
					true
				);
			}

			if (Date.now() - startTime >= maxWaitMs) {
				clearInterval(checkContext);
				LoggerService.warn(
					namespaces.datadog,
					t("datadog.sessionTimeout", { ns: "utilities", timeout: maxWaitMs }),
					true
				);
				resolve(false);
			}
		}, checkInterval);
	});
};

const init = (config: RumInitConfiguration): boolean => {
	try {
		const rumConfig: RumInitConfiguration = {
			applicationId: config.applicationId,
			clientToken: config.clientToken,
			site: config.site,
			service: config.service || "web-platform",
			env: config.env || "development",
			version: config.version,
			allowedTracingUrls: config.allowedTracingUrls,
			defaultPrivacyLevel: config.defaultPrivacyLevel,
			sessionSampleRate: 100,
			sessionReplaySampleRate: 100,
			trackSessionAcrossSubdomains: false,
			useSecureSessionCookie: true,
			usePartitionedCrossSiteSessionCookie: true,
			allowFallbackToLocalStorage: true,
			silentMultipleInit: true,
			trackResources: true,
			trackLongTasks: true,
			trackUserInteractions: true,
			plugins: [reactPlugin({ router: true })],
		};

		datadogRum.init(rumConfig);
		initCalled = true;

		setTimeout(() => {
			try {
				const context = datadogRum.getInternalContext();
				if (!context?.session_id) {
					throw new Error("Session not yet available after initialization");
				}
			} catch (error) {
				LoggerService.warn(
					namespaces.datadog,
					t("datadog.unableToVerifySession", { ns: "utilities", error: String(error) }),
					true
				);
			}
		}, 150);

		return true;
	} catch (error) {
		LoggerService.error(
			namespaces.datadog,
			t("datadog.failedToInitialize", { ns: "utilities", error: String(error) }),
			true
		);
		initCalled = false;
		return false;
	}
};

const setUser = (userId: string, userInfo: User): void => {
	if (!isInitialized()) return;

	datadogRum.setUser({
		id: userId,
		email: userInfo.email,
		name: userInfo.name,
	});
	datadogRum.setGlobalContextProperty("user.id", userId);
	datadogRum.setGlobalContextProperty("user.email", userInfo.email);
	datadogRum.setGlobalContextProperty("user.name", userInfo.name);
};

const setOrg = (orgId: string, orgInfo: Organization): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("organization.id", orgId);
	datadogRum.setGlobalContextProperty("organization.name", orgInfo.displayName);
	datadogRum.setGlobalContextProperty("organization.uniqueName", orgInfo.uniqueName);
};

const setProject = (projectId: string, projectInfo: Project): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("project.id", projectId);
	datadogRum.setGlobalContextProperty("project.name", projectInfo.name);
	if (projectInfo.organizationId) {
		datadogRum.setGlobalContextProperty("project.organizationId", projectInfo.organizationId);
	}
};

const setUserRole = (role: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("user.role", role);
};

const setPlanType = (planType: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("billing.planType", planType);
};

const setDeploymentId = (deploymentId: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("deployment.id", deploymentId);
};

const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
	if (!isInitialized()) return;

	datadogRum.addAction(eventName, properties);
};

const setSessionId = (sessionId: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("session.id", sessionId);
};

const setEventId = (eventId: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("event.id", eventId);
};

const startNamedView = (name: string, service: string): void => {
	if (!isInitialized()) return;

	datadogRum.startView({
		name,
		service,
	});
};

const setCorrelationId = (correlationId: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("akCorrelationId", correlationId);
};

const setPageContext = (pageContext: {
	hash?: string;
	organizationId?: string;
	path: string;
	search?: string;
	title?: string;
}): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("page.path", pageContext.path);

	if (pageContext.search !== undefined) {
		datadogRum.setGlobalContextProperty("page.search", pageContext.search);
	}

	if (pageContext.hash !== undefined) {
		datadogRum.setGlobalContextProperty("page.hash", pageContext.hash);
	}

	if (pageContext.title !== undefined) {
		datadogRum.setGlobalContextProperty("page.title", pageContext.title);
	}

	if (pageContext.organizationId !== undefined) {
		datadogRum.setGlobalContextProperty("page.organizationId", pageContext.organizationId);
	}
};

const initializeForAppStartup = () => {
	const urlParams = new URLSearchParams(window.location.search);
	const hasE2eParam = urlParams.get("e2e") === "true";
	const userAgent = navigator.userAgent.toLowerCase();
	const hasHeadless = userAgent.includes("headless");
	const storedE2eFlag = localStorage.getItem("e2e") === "true";
	const isE2eTest = hasE2eParam || hasHeadless || storedE2eFlag;

	if (hasE2eParam && !storedE2eFlag) {
		localStorage.setItem("e2e", "true");
	}

	if (isE2eTest) {
		return;
	}

	if (!ddConfigured) {
		LoggerService.warn(namespaces.datadog, t("datadog.notConfiguredSkipping", { ns: "utilities" }), true);
		return;
	}

	if (isInitialized()) {
		return;
	}

	const akCorrelationId = CorrelationIdUtils.generate();
	const initResult = init(datadogConstants);

	if (initResult) {
		setCorrelationId(akCorrelationId);
		return;
	}
	LoggerService.warn(
		namespaces.datadog,
		t("datadog.failedToInitialize", { ns: "utilities", error: "could not initialize datadog" }),
		true
	);
};

export const DatadogUtils = {
	init,
	waitForSession,
	setUser,
	setOrg,
	setProject,
	setUserRole,
	setPlanType,
	setDeploymentId,
	trackEvent,
	setSessionId,
	setEventId,
	startNamedView,
	setCorrelationId,
	setPageContext,
	isInitialized,
	initializeForAppStartup,
};
