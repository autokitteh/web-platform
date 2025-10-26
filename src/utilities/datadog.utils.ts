/* eslint-disable no-console */
import { datadogRum } from "@datadog/browser-rum";
import type { RumInitConfiguration } from "@datadog/browser-rum";
// import { reactPlugin } from "@datadog/browser-rum-react"; // Temporarily disabled

import { Organization, Project, User } from "@src/types/models";

/**
 * Datadog RUM (Real User Monitoring) integration utilities for performance monitoring and analytics.
 * Provides a typed wrapper around the Datadog RUM API for tracking user behavior, performance metrics,
 * and custom events with proper context enrichment.
 *
 * All data is sent to Datadog RUM for analysis in the Datadog dashboard, including session replays,
 * error tracking, and performance monitoring when configured.
 */
export const DatadogUtils = {
	/**
	 * Initializes Datadog RUM with the provided configuration.
	 * Should be called once at application startup before any other Datadog methods.
	 *
	 * @param config - Datadog RUM initialization configuration
	 * @returns true if initialization was successful, false otherwise
	 */
	init: (config: RumInitConfiguration): boolean => {
		try {
			const rumConfig: RumInitConfiguration = {
				applicationId: config.applicationId,
				clientToken: config.clientToken,
				site: config.site,
				service: config.service || "web-platform",
				env: config.env || "development",
				version: config.version,
				sessionSampleRate: 100,
				sessionReplaySampleRate: 100,
				trackSessionAcrossSubdomains: true,
				useSecureSessionCookie: true,
				allowFallbackToLocalStorage: true,
				silentMultipleInit: true,
				trackResources: true,
				trackLongTasks: true,
				trackUserInteractions: true,
				beforeSend: () => true,
			};

			datadogRum.init(rumConfig);

			try {
				datadogRum.getInternalContext();
			} catch (error) {
				console.log("[Datadog] 🚀 Immediate context check failed:", error);
			}

			const isInitialized = !!window.DD_RUM;
			console.log("[Datadog] 🚀 Init completed, window.DD_RUM:", window.DD_RUM);
			console.log("[Datadog] 🚀 Is initialized:", isInitialized);

			console.log(
				"[Datadog] Cookie state:",
				document.cookie.split(";").filter((c) => c.includes("_dd"))
			);

			setTimeout(() => {
				const context = datadogRum.getInternalContext();
				console.log("[Datadog] Delayed context check:", {
					hasSession: !!context?.session_id,
					sessionId: context?.session_id,
					sessionPlan: (context as any)?.session?.plan,
					sessionSampled: (context as any)?.session?.sampled,
					hasView: !!context?.view?.id,
				});

				if (!context?.session_id) {
					console.warn("[Datadog] No session ID after init - attempting to start session recording");
					try {
						datadogRum.startSessionReplayRecording();
						console.log("[Datadog] Session replay recording started manually");
					} catch (error) {
						console.error("[Datadog] Failed to start session replay:", error);
					}
				}
			}, 100);

			return isInitialized;
		} catch (error) {
			console.error("[Datadog] ❌ Failed to initialize:", error);
			return false;
		}
	},

	/**
	 * Sets user identification in Datadog RUM.
	 * Associates all subsequent events and sessions with this user for tracking and segmentation.
	 *
	 * @param userId - Unique user identifier
	 * @param userInfo - Complete user information object
	 */
	setUser: (userId: string, userInfo: User) => {
		if (!window.DD_RUM) return;

		datadogRum.setUser({
			id: userId,
			email: userInfo.email,
			name: userInfo.name,
		});
		datadogRum.setGlobalContextProperty("user.id", userId);
		datadogRum.setGlobalContextProperty("user.email", userInfo.email);
		datadogRum.setGlobalContextProperty("user.name", userInfo.name);
	},

	/**
	 * Sets the current organization context in Datadog RUM.
	 * Enriches all events with organization information for multi-tenant analysis.
	 *
	 * @param orgId - Unique organization identifier
	 * @param orgInfo - Complete organization information object
	 */
	setOrg: (orgId: string, orgInfo: Organization) => {
		if (!window.DD_RUM) return;

		datadogRum.setGlobalContextProperty("organization.id", orgId);
		datadogRum.setGlobalContextProperty("organization.name", orgInfo.displayName);
		datadogRum.setGlobalContextProperty("organization.uniqueName", orgInfo.uniqueName);
	},

	/**
	 * Sets the current project context in Datadog RUM.
	 * Tracks which project the user is working with for feature usage analysis.
	 *
	 * @param projectId - Unique project identifier
	 * @param projectInfo - Complete project information object
	 */
	setProject: (projectId: string, projectInfo: Project) => {
		if (!window.DD_RUM) return;

		datadogRum.setGlobalContextProperty("project.id", projectId);
		datadogRum.setGlobalContextProperty("project.name", projectInfo.name);
		if (projectInfo.organizationId) {
			datadogRum.setGlobalContextProperty("project.organizationId", projectInfo.organizationId);
		}
	},

	/**
	 * Sets the user's role for analytics segmentation.
	 * Enables analysis of behavior patterns across different user permission levels.
	 *
	 * @param role - User role (e.g., "admin", "member", "viewer")
	 */
	setUserRole: (role: string) => {
		if (!window.DD_RUM) return;

		datadogRum.setGlobalContextProperty("user.role", role);
	},

	/**
	 * Sets the user's subscription plan type.
	 * Used for analyzing feature adoption and usage patterns across plan tiers.
	 *
	 * @param planType - Plan type (e.g., "free", "pro", "enterprise")
	 */
	setPlanType: (planType: string) => {
		if (!window.DD_RUM) return;

		datadogRum.setGlobalContextProperty("billing.planType", planType);
	},

	/**
	 * Sets the current deployment context in Datadog RUM.
	 * Associates events with specific deployments for correlation with deployment performance.
	 *
	 * @param deploymentId - Unique deployment identifier
	 */
	setDeploymentId: (deploymentId: string) => {
		if (!window.DD_RUM) return;

		datadogRum.setGlobalContextProperty("deployment.id", deploymentId);
	},

	/**
	 * Tracks a custom user action in Datadog RUM.
	 * Creates a custom action event with optional metadata for detailed analytics.
	 *
	 * @param eventName - Name of the action/event to track
	 * @param properties - Optional event properties/metadata
	 */
	trackEvent: (eventName: string, properties?: Record<string, any>) => {
		if (!window.DD_RUM) return;

		datadogRum.addAction(eventName, properties);
	},

	/**
	 * Sets the current session context in Datadog RUM.
	 * Links RUM sessions with application-level session identifiers for cross-system analysis.
	 *
	 * @param sessionId - Application session identifier
	 */
	setSessionId: (sessionId: string) => {
		if (!window.DD_RUM) return;

		datadogRum.setGlobalContextProperty("session.id", sessionId);
	},

	/**
	 * Sets the current event context in Datadog RUM.
	 * Associates RUM data with specific application events for debugging and analysis.
	 *
	 * @param eventId - Unique event identifier
	 */
	setEventId: (eventId: string) => {
		if (!window.DD_RUM) return;

		datadogRum.setGlobalContextProperty("event.id", eventId);
	},

	/**
	 * Starts a named page view tracking in Datadog RUM with service context.
	 * Provides more detailed view tracking with custom name and service information.
	 *
	 * @param name - Custom name for the view
	 * @param service - Service name for the view
	 */
	startNamedView: (name: string, service: string) => {
		if (!window.DD_RUM) return;

		datadogRum.startView({
			name,
			service,
		});
	},

	/**
	 * Sets page context properties in Datadog RUM.
	 * Updates all page-related context properties for detailed analytics.
	 *
	 * @param pageContext - Page context including path, search, hash, title, and organizationId
	 */
	setPageContext: (pageContext: {
		hash?: string;
		organizationId?: string;
		path: string;
		search?: string;
		title?: string;
	}) => {
		if (!window.DD_RUM) return;

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
	},

	/**
	 * Gets the current Datadog RUM session ID.
	 * Returns the session ID for linking RUM data across applications.
	 *
	 * @returns The current session ID or undefined if not available
	 */
	getSessionId: (): string | undefined => {
		if (!window.DD_RUM) return undefined;

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
	},

	/**
	 * Gets the current Datadog RUM view ID.
	 * Returns the view ID for linking RUM data across applications.
	 *
	 * @returns The current view ID or undefined if not available
	 */
	getViewId: (): string | undefined => {
		if (!window.DD_RUM) return undefined;

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
	},

	/**
	 * Checks if Datadog RUM is properly initialized and ready.
	 * Verifies SDK presence, session creation, and proper cookie domain configuration.
	 *
	 * @returns true if Datadog is initialized with active session, false otherwise
	 */
	isInitialized: (): boolean => {
		if (!window.DD_RUM) return false;

		try {
			const hasInitMethod = typeof (window.DD_RUM as any).init === "function";
			const hasSetUserMethod = typeof (window.DD_RUM as any).setUser === "function";

			const context = datadogRum.getInternalContext();
			const hasContext = !!context;
			const hasSessionId = !!context?.session_id;

			const cookies = document.cookie.split(";");
			const datadogCookies = cookies
				.map((cookie) => cookie.trim())
				.filter((cookie) => cookie.startsWith("_dd_s=") || cookie.startsWith("_dd="));

			const hasDatadogCookie = datadogCookies.length > 0;

			const wildcardCookieExists = cookies.some((cookie) => {
				const trimmed = cookie.trim();
				return trimmed.startsWith("_dd_s=") && window.location.hostname.includes(".autokitteh.cloud");
			});

			console.log("[Datadog] Initialization check:", {
				hasInitMethod,
				hasSetUserMethod,
				hasContext,
				hasSessionId,
				hasDatadogCookie,
				wildcardCookieExists,
				cookieCount: datadogCookies.length,
				currentDomain: window.location.hostname,
				ddRumVersion: (window.DD_RUM as any).version,
			});

			return hasInitMethod && hasSetUserMethod && hasDatadogCookie && hasSessionId;
		} catch (error) {
			console.error("Failed to verify Datadog initialization:", error);
			return false;
		}
	},

	/**
	 * Gets detailed information about Datadog cookies in the current context.
	 * Useful for debugging cross-domain cookie sharing issues.
	 *
	 * @returns Array of Datadog cookie information with parsed values
	 */
	getCookieInfo: (): Array<{
		name: string;
		parsed: {
			aid?: string;
			created?: string;
			expire?: string;
			id?: string;
			lock?: string;
			logs?: string;
		};
		value: string;
	}> => {
		const cookies = document.cookie.split(";");
		const datadogCookies = cookies
			.map((cookie) => cookie.trim())
			.filter((cookie) => cookie.startsWith("_dd_s=") || cookie.startsWith("_dd="));

		return datadogCookies.map((cookie) => {
			const [name, value] = cookie.split("=");
			const parsed: any = {};

			value.split("&").forEach((part) => {
				const [key, val] = part.split("=");
				if (key && val) {
					parsed[key] = val;
				}
			});

			return { name, value, parsed };
		});
	},

	/**
	 * Logs comprehensive Datadog session information for debugging.
	 * Includes cookie details, session IDs, and domain information.
	 */
	logSessionInfo: (): void => {
		if (!window.DD_RUM) {
			console.log("[Datadog] Not initialized - no session info available");
			return;
		}

		try {
			const context = datadogRum.getInternalContext();
			const cookieInfo = DatadogUtils.getCookieInfo();

			console.log("[Datadog] Session Info:", {
				currentDomain: window.location.hostname,
				sessionId: context?.session_id,
				viewId: context?.view?.id,
				applicationId: context?.application_id,
				cookies: cookieInfo,
				cookieCount: cookieInfo.length,
			});
		} catch (error) {
			console.error("[Datadog] Failed to get session info:", error);
		}
	},
};
