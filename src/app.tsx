import React, { useEffect } from "react";

import * as Sentry from "@sentry/react";
import { useTranslation } from "react-i18next";
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router-dom";

import { isProduction } from "@constants";

import { PageTitle } from "@components/atoms";
import { Toast } from "@components/molecules";
import { DeploymentsTable, SessionsTable } from "@components/organisms";
import { CodeTable } from "@components/organisms/code";
import { ConnectionsTable, EditConnection } from "@components/organisms/connections";
import { AddConnection } from "@components/organisms/connections/add";
import { SessionViewer } from "@components/organisms/deployments";
import { ActivityList, SessionOutputs } from "@components/organisms/deployments/sessions/tabs";
import { Profile, Security } from "@components/organisms/settings";
import { AddTrigger, EditTrigger, TriggersTable } from "@components/organisms/triggers";
import { AddVariable, EditVariable, VariablesTable } from "@components/organisms/variables";
import { Connections, Dashboard, Intro, NotFound404, Project, Sessions, Triggers, Variables } from "@components/pages";
import { AppLayout } from "@components/templates";
import { SettingsLayout } from "@components/templates/settingsLayout";

export const App = () => {
	let AKRoutes = Routes;
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });

	if (isProduction) {
		Sentry.init({
			dsn: import.meta.env.VITE_SENTRY_DSN,
			integrations: [
				// See docs for support of different versions of variation of react router
				// https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
				Sentry.reactRouterV6BrowserTracingIntegration({
					useEffect,
					useLocation,
					useNavigationType,
					createRoutesFromChildren,
					matchRoutes,
				}),
				Sentry.replayIntegration(),
			],
			// Set tracesSampleRate to 1.0 to capture 100%
			// of transactions for tracing.
			tracesSampleRate: 1.0,
			// Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
			tracePropagationTargets: [
				"localhost",
				/^https:\/\/staging.autokitteh\.cloud/,
				/^https:\/\/ak-cloud.netlify\.app/,
			],
			// Capture Replay for 10% of all sessions,
			// plus for 100% of sessions with an error
			replaysSessionSampleRate: 0.1,
			replaysOnErrorSampleRate: 1.0,
		});
		AKRoutes = Sentry.withSentryReactRouterV6Routing(Routes);
	}

	return (
		<BrowserRouter>
			<AKRoutes>
				<Route element={<AppLayout className="pr-0" />} path="/">
					<Route
						element={
							<>
								<PageTitle title={t("template", { page: t("home") })} />
								<Dashboard />
							</>
						}
						index
					/>

					<Route
						element={
							<>
								<PageTitle title={t("template", { page: t("intro") })} />
								<Intro />
							</>
						}
						path="intro"
					/>

					<Route
						element={
							<>
								<PageTitle title={t("template", { page: t("404") })} />
								<NotFound404 />
							</>
						}
						path="404"
					/>
				</Route>

				<Route element={<AppLayout topbarVariant="actions" />} path="projects">
					<Route element={<Project />} path=":projectId">
						<Route element={<Navigate replace to="code" />} index />

						<Route element={<Connections />} path="connections">
							<Route element={<ConnectionsTable />} index />

							<Route element={<AddConnection />} path="add" />

							<Route element={<EditConnection />} path=":connectionId/edit" />

							<Route element={<Navigate replace to="/404" />} path="*" />
						</Route>

						<Route element={<CodeTable />} path="code" />

						<Route element={<Triggers />} path="triggers">
							<Route element={<TriggersTable />} index />

							<Route element={<AddTrigger />} path="add" />

							<Route element={<EditTrigger />} path=":triggerId/edit" />

							<Route element={<Navigate replace to="/404" />} path="*" />
						</Route>

						<Route element={<Variables />} path="variables">
							<Route element={<VariablesTable />} index />

							<Route element={<AddVariable />} path="add" />

							<Route element={<EditVariable />} path="edit/:environmentId/:variableName" />

							<Route element={<Navigate replace to="/404" />} path="*" />
						</Route>

						<Route element={<Navigate replace to="/404" />} path="*" />
					</Route>

					<Route element={<Navigate replace to="/404" />} path="*" />
				</Route>

				<Route element={<AppLayout topbarVariant="manual" />} path="projects/:projectId/deployments">
					<Route element={<DeploymentsTable />} index />
					<Route element={<Navigate replace to="/404" />} path="*" />
				</Route>

				<Route element={<AppLayout topbarVariant="basic" />} path="projects/:projectId/deployments">
					<Route element={<Sessions />} path=":deploymentId">
						<Route element={<SessionsTable />} path="sessions">
							<Route element={<SessionViewer />} path=":sessionId">
								<Route element={<SessionOutputs />} index />
								<Route element={<ActivityList />} path="executionflow" />
							</Route>
						</Route>
					</Route>
					<Route element={<Navigate replace to="/404" />} path="*" />
				</Route>

				<Route element={<SettingsLayout />} path="settings">
					<Route element={<Profile />} index />
					<Route element={<Security />} path="security" />

					<Route element={<Navigate replace to="/404" />} path="*" />
				</Route>

				<Route element={<Navigate replace to="/404" />} path="*" />
			</AKRoutes>

			<Toast />
		</BrowserRouter>
	);
};
