/* eslint-disable no-console */
import * as Sentry from "@sentry/react";

/**
 * Sentry integration utilities for error tracking and performance monitoring.
 * Provides initialization and helper methods for Sentry error tracking.
 *
 * All methods include error handling to ensure graceful degradation if Sentry fails.
 */
export const SentryUtils = {
	/**
	 * Initializes Sentry with React Router integration.
	 * Should be called once at application startup.
	 *
	 * @param config - Sentry initialization configuration
	 * @param config.dsn - Sentry DSN (Data Source Name)
	 * @param config.useEffect - React useEffect hook for integration
	 * @param config.useLocation - React Router useLocation hook for integration
	 * @param config.useNavigationType - React Router useNavigationType hook for integration
	 * @param config.createRoutesFromChildren - React Router helper function
	 * @param config.matchRoutes - React Router helper function
	 * @param config.tracesSampleRate - Sample rate for performance traces (0-1)
	 * @param config.tracePropagationTargets - URLs to enable trace propagation
	 * @returns true if initialization was successful, false otherwise
	 */
	init: (config: {
		createRoutesFromChildren: any;
		dsn: string;
		matchRoutes: any;
		tracePropagationTargets?: (string | RegExp)[];
		tracesSampleRate?: number;
		useEffect: typeof import("react").useEffect;
		useLocation: any;
		useNavigationType: any;
	}): boolean => {
		try {
			Sentry.init({
				dsn: config.dsn,
				integrations: [
					// React Router v7 Browser Tracing Integration
					Sentry.reactRouterV7BrowserTracingIntegration({
						useEffect: config.useEffect,
						useLocation: config.useLocation,
						useNavigationType: config.useNavigationType,
						createRoutesFromChildren: config.createRoutesFromChildren,
						matchRoutes: config.matchRoutes,
					}),
					// Feedback Integration for user feedback collection
					Sentry.feedbackIntegration({
						colorScheme: "system",
						autoInject: false,
					}),
				],
				tracesSampleRate: config.tracesSampleRate ?? 1.0,
				tracePropagationTargets: config.tracePropagationTargets ?? ["localhost"],
			});
			return true;
		} catch (error) {
			console.error("Failed to initialize Sentry:", error);
			return false;
		}
	},

	/**
	 * Captures an exception in Sentry.
	 *
	 * @param error - The error to capture
	 * @param context - Optional context information
	 */
	captureException: (error: any, context?: Record<string, any>) => {
		try {
			if (context) {
				Sentry.captureException(error, { extra: context });
			} else {
				Sentry.captureException(error);
			}
		} catch (e) {
			console.error("Failed to capture exception in Sentry:", e);
		}
	},

	/**
	 * Captures a message in Sentry.
	 *
	 * @param message - The message to capture
	 * @param level - Severity level
	 * @returns Event ID of the captured message
	 */
	captureMessage: (message: string, level?: Sentry.SeverityLevel): string => {
		try {
			return Sentry.captureMessage(message, level);
		} catch (error) {
			console.error("Failed to capture message in Sentry:", error);
			return "";
		}
	},

	/**
	 * Captures user feedback in Sentry.
	 *
	 * @param feedback - User feedback data
	 */
	captureFeedback: (feedback: { email?: string; event_id: string; message: string; name?: string }) => {
		try {
			Sentry.captureFeedback(feedback);
		} catch (error) {
			console.error("Failed to capture feedback in Sentry:", error);
		}
	},

	/**
	 * Gets the current Sentry scope.
	 *
	 * @returns Current Sentry scope
	 */
	getCurrentScope: () => {
		try {
			return Sentry.getCurrentScope();
		} catch (error) {
			console.error("Failed to get Sentry scope:", error);
			return null;
		}
	},

	/**
	 * Adds a breadcrumb to Sentry for debugging.
	 *
	 * @param breadcrumb - Breadcrumb data
	 */
	addBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => {
		try {
			Sentry.addBreadcrumb(breadcrumb);
		} catch (error) {
			console.error("Failed to add breadcrumb in Sentry:", error);
		}
	},

	/**
	 * Wraps React Router Routes with Sentry error boundaries and performance monitoring.
	 *
	 * @param Routes - React Router Routes component
	 * @returns Wrapped Routes component
	 */
	withSentryReactRouterV7Routing: (Routes: any) => {
		try {
			return Sentry.withSentryReactRouterV7Routing(Routes);
		} catch (error) {
			console.error("Failed to wrap routes with Sentry:", error);
			return Routes;
		}
	},
};
