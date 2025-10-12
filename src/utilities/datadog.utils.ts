import { datadogRum } from "@datadog/browser-rum";
import type { RumInitConfiguration } from "@datadog/browser-rum";

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
			datadogRum.init(config);
			return true;
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("Failed to initialize Datadog RUM:", error);
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
	 * Starts a new page view tracking in Datadog RUM.
	 * Records a view change with the full path including search parameters.
	 *
	 * @param path - Full path including pathname and search parameters
	 */
	startView: (path: string) => {
		if (!window.DD_RUM) return;

		datadogRum.startView(path);
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
};
