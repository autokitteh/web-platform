import { datadogRum } from "@datadog/browser-rum";
import type { RumInitConfiguration } from "@datadog/browser-rum";
import { reactPlugin } from "@datadog/browser-rum-react";
import { t } from "i18next";

import { LoggerService } from "@services/logger.service";
import { datadogConstants, ddConfigured, namespaces } from "@src/constants";
import { Organization, Project, User } from "@src/types/models";
import { isE2E } from "@src/utilities";
import { CorrelationIdUtils } from "@src/utilities/correlationId.utils";

let initCalled = false;

/**
 * Indicates whether Datadog RUM was initialized and is currently available on the page.
 *
 * @returns {boolean} True if initialization was attempted and `window.DD_RUM` exists.
 */
const isInitialized = (): boolean => {
	return initCalled && !!window.DD_RUM;
};

/**
 * Waits until a Datadog RUM session is available or the timeout elapses.
 *
 * Useful when subsequent actions depend on an active RUM session (e.g., correlating events).
 *
 * @param {number} [maxWaitMs=2000] The maximum time, in milliseconds, to wait for a session.
 * @returns {Promise<boolean>} Resolves with true if a session is detected before timeout; otherwise false.
 */
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

/**
 * Initializes Datadog RUM with the provided configuration.
 *
 * Re-initialization is safe due to `silentMultipleInit` but is generally unnecessary.
 *
 * @param {RumInitConfiguration} config The RUM initialization configuration.
 * @returns {boolean} True if initialization completed without throwing; otherwise false.
 */
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

/**
 * Sets the Datadog RUM user context and common user fields.
 *
 * @param {string} userId The user identifier.
 * @param {User} userInfo Additional user information (email, name).
 * @returns {void}
 */
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

/**
 * Sets the organization details on the global RUM context.
 *
 * @param {string} orgId The organization identifier.
 * @param {Organization} orgInfo Organization details (displayName, uniqueName).
 * @returns {void}
 */
const setOrg = (orgId: string, orgInfo: Organization): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("organization.id", orgId);
	datadogRum.setGlobalContextProperty("organization.name", orgInfo.displayName);
	datadogRum.setGlobalContextProperty("organization.uniqueName", orgInfo.uniqueName);
};

/**
 * Sets the project details on the global RUM context.
 *
 * @param {string} projectId The project identifier.
 * @param {Project} projectInfo Project info including name and optional organizationId.
 * @returns {void}
 */
const setProject = (projectId: string, projectInfo: Project): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("project.id", projectId);
	datadogRum.setGlobalContextProperty("project.name", projectInfo.name);
	if (projectInfo.organizationId) {
		datadogRum.setGlobalContextProperty("project.organizationId", projectInfo.organizationId);
	}
};

/**
 * Sets the current user's role in the global RUM context.
 *
 * @param {string} role The user's role name.
 * @returns {void}
 */
const setUserRole = (role: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("user.role", role);
};

/**
 * Sets the billing plan type in the global RUM context.
 *
 * @param {string} planType The billing plan type (e.g., Free, Pro, Enterprise).
 * @returns {void}
 */
const setPlanType = (planType: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("billing.planType", planType);
};

/**
 * Sets the active deployment identifier in the global RUM context.
 *
 * @param {string} deploymentId The deployment identifier.
 * @returns {void}
 */
const setDeploymentId = (deploymentId: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("deployment.id", deploymentId);
};

/**
 * Records a Datadog RUM action event with optional properties.
 *
 * @param {string} eventName The action name.
 * @param {Record<string, any>} [properties] Additional contextual properties.
 * @returns {void}
 */
const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
	if (!isInitialized()) return;

	datadogRum.addAction(eventName, properties);
};

/**
 * Sets a custom session identifier in the global RUM context.
 *
 * Note: This does not modify the Datadog-native session id; it stores a parallel field.
 *
 * @param {string} sessionId The session identifier to persist in context.
 * @returns {void}
 */
const setSessionId = (sessionId: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("session.id", sessionId);
};

/**
 * Sets a custom event identifier in the global RUM context.
 *
 * @param {string} eventId The event identifier to persist in context.
 * @returns {void}
 */
const setEventId = (eventId: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("event.id", eventId);
};

/**
 * Starts a named RUM view for fine-grained service navigation tracking.
 *
 * @param {string} name The view name.
 * @param {string} service The logical service name associated with the view.
 * @returns {void}
 */
const startNamedView = (name: string, service: string): void => {
	if (!isInitialized()) return;

	datadogRum.startView({
		name,
		service,
	});
};

/**
 * Attaches an AutoKitteh correlation identifier to the global RUM context.
 *
 * @param {string} correlationId A unique correlation id (e.g., for request tracing).
 * @returns {void}
 */
const setCorrelationId = (correlationId: string): void => {
	if (!isInitialized()) return;

	datadogRum.setGlobalContextProperty("akCorrelationId", correlationId);
};

/**
 * Sets common page-related fields in the global RUM context.
 *
 * @param {{hash?: string; organizationId?: string; path: string; search?: string; title?: string;}} pageContext
 * The page context to record.
 * @returns {void}
 */
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

/**
 * Captures a message event in Datadog RUM.
 *
 * @param {string} message The message to capture.
 * @param {"error" | "warning" | "info" | "debug"} [level="info"] The severity level.
 * @param {Record<string, any>} [context] Additional context properties.
 * @returns {void}
 */
const captureMessage = (
	message: string,
	level: "error" | "warning" | "info" | "debug" = "info",
	context?: Record<string, any>
): void => {
	if (!isInitialized()) return;

	datadogRum.addAction(`message:${level}`, {
		message,
		level,
		...context,
	});
};

/**
 * Captures an exception/error in Datadog RUM.
 *
 * @param {Error | any} error The error object or message.
 * @param {Record<string, any>} [context] Additional context properties (tags, extra info).
 * @returns {void}
 */
const captureException = (error: Error | any, context?: Record<string, any>): void => {
	if (!isInitialized()) return;

	const errorMessage = error?.message || String(error);
	const errorName = error?.name || "UnknownError";
	const errorStack = error?.stack || "";

	datadogRum.addAction("exception", {
		error: errorMessage,
		errorName,
		errorStack,
		...context,
	});
};

/**
 * Captures a warning in Datadog RUM.
 *
 * @param {string} message The warning message.
 * @param {Record<string, any>} [context] Additional context properties.
 * @returns {void}
 */
const captureWarning = (message: string, context?: Record<string, any>): void => {
	if (!isInitialized()) return;

	datadogRum.addAction("warning", {
		message,
		...context,
	});
};

/**
 * Boot-time initializer to configure Datadog RUM for the application startup.
 *
 * Skips initialization for e2e and headless contexts, and when Datadog is not configured.
 * Also sets a fresh correlation id upon successful initialization.
 *
 * @returns {void}
 */
const initializeForAppStartup = () => {
	if (isE2E()) {
		localStorage.setItem("e2e", "true");
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
	captureMessage,
	captureException,
	captureWarning,
	isInitialized,
	initializeForAppStartup,
};
