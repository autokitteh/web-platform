/* eslint-disable no-console */
import { datadogRum } from "@datadog/browser-rum";
import type { RumInitConfiguration } from "@datadog/browser-rum";
import { reactPlugin } from "@datadog/browser-rum-react";

import { Organization, Project, User } from "@src/types/models";

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
					console.log("[Datadog] Session ready after", Date.now() - startTime, "ms");
					resolve(true);
					return;
				}
			} catch (error) {
				console.warn("[Datadog] Error checking session context:", error);
			}

			if (Date.now() - startTime >= maxWaitMs) {
				clearInterval(checkContext);
				console.warn("[Datadog] Session not available after", maxWaitMs, "ms timeout");
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
			usePartitionedCrossSiteSessionCookie: false,
			allowFallbackToLocalStorage: true,
			silentMultipleInit: true,
			trackResources: true,
			trackLongTasks: true,
			trackUserInteractions: true,
			plugins: [reactPlugin({ router: true })],
		};

		console.log("[Datadog] Initializing with config:", {
			service: rumConfig.service,
			env: rumConfig.env,
			trackSessionAcrossSubdomains: rumConfig.trackSessionAcrossSubdomains,
			useSecureSessionCookie: rumConfig.useSecureSessionCookie,
			usePartitionedCrossSiteSessionCookie: rumConfig.usePartitionedCrossSiteSessionCookie,
		});

		datadogRum.init(rumConfig);
		initCalled = true;

		setTimeout(() => {
			try {
				const context = datadogRum.getInternalContext();
				if (context?.session_id) {
					console.log("[Datadog] Session ready:", {
						sessionId: context.session_id,
						viewId: context.view?.id,
						applicationId: context.application_id,
					});
				} else {
					console.warn("[Datadog] Session not yet available after initialization");
				}
			} catch (error) {
				console.warn("[Datadog] Unable to verify session context:", error);
			}
		}, 150);

		return true;
	} catch (error) {
		console.error("[Datadog] ❌ Failed to initialize:", error);
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

const getSessionId = (): string | undefined => {
	if (!isInitialized()) return undefined;

	try {
		const context = datadogRum.getInternalContext();
		const sessionId = context?.session_id;

		if (!sessionId) {
			console.warn("[Datadog] Session ID not yet available - session may still be initializing");
		}

		return sessionId;
	} catch (error) {
		console.error("Failed to get Datadog session ID:", error);
		return undefined;
	}
};

const getViewId = (): string | undefined => {
	if (!isInitialized()) return undefined;

	try {
		const context = datadogRum.getInternalContext();
		const viewId = context?.view?.id;

		if (!viewId) {
			console.warn("[Datadog] View ID not yet available - view may still be initializing");
		}

		return viewId;
	} catch (error) {
		console.error("Failed to get Datadog view ID:", error);
		return undefined;
	}
};

const logSessionInfo = (): void => {
	if (!isInitialized()) {
		console.log("[Datadog] Not initialized - no session info available");
		return;
	}

	try {
		const context = datadogRum.getInternalContext();

		console.log("[Datadog] Session Info:", {
			currentDomain: window.location.hostname,
			sessionId: context?.session_id,
			viewId: context?.view?.id,
			applicationId: context?.application_id,
		});
	} catch (error) {
		console.error("[Datadog] Failed to get session info:", error);
	}
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
	getSessionId,
	getViewId,
	isInitialized,
	logSessionInfo,
};
