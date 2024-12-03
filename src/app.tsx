import React, { useEffect } from "react";

import * as Sentry from "@sentry/react";
import { useTranslation } from "react-i18next";
import {
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
import { DeploymentsTable, EventViewer, EventsTable, SessionsTable } from "@components/organisms";
import { CodeTable } from "@components/organisms/code";
import { ConnectionsTable, EditConnection } from "@components/organisms/connections";
import { AddConnection } from "@components/organisms/connections/add";
import { SessionViewer } from "@components/organisms/deployments";
import { ActivityList, SessionOutputs } from "@components/organisms/deployments/sessions/tabs";
import { ClientConfiguration, Profile } from "@components/organisms/settings";
import { AddTrigger, EditTrigger, TriggersTable } from "@components/organisms/triggers";
import { AddVariable, EditVariable, VariablesTable } from "@components/organisms/variables";
import { Connections, Dashboard, Internal404, Intro, Project, Sessions, Triggers, Variables } from "@components/pages";
import { AppLayout, EventsLayout } from "@components/templates";
import { SettingsLayout } from "@components/templates/settingsLayout";

export const App = () => {
	let AKRoutes = Routes;
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });

	if (isProduction) {
		Sentry.init({
			dsn: import.meta.env.SENTRY_DSN,
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
			],
			// Set tracesSampleRate to 1.0 to capture 100%
			// of transactions for tracing.
			tracesSampleRate: 1.0,
			// Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
			tracePropagationTargets: [
				"localhost",
				/^https:\/\/[\w.-]+\.autokitteh\.cloud/,
				/^https:\/\/autokitteh\.cloud/,
			],
		});
		AKRoutes = Sentry.withSentryReactRouterV6Routing(Routes);
	}

	return (
		<AKRoutes>
			<Route element={<AppLayout hideTopbar />} path="/">
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
							<Internal404 />
						</>
					}
					path="404"
				/>
				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route element={<AppLayout />} path="projects">
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

						<Route element={<EditVariable />} path="edit/:variableName" />

						<Route element={<Navigate replace to="/404" />} path="*" />
					</Route>

					<Route element={<Navigate replace to="/404" />} path="*" />
				</Route>

				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route element={<AppLayout />} path="projects/:projectId/deployments">
				<Route element={<DeploymentsTable />} index />
				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route element={<AppLayout />} path="projects/:projectId/deployments">
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
				<Route element={<ClientConfiguration />} path="client-configuration" />

				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route element={<EventsLayout />}>
				<Route element={<EventsTable />} path="events">
					<Route element={<EventViewer />} path=":eventId" />
				</Route>

				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route element={<Navigate replace to="/404" />} path="*" />
			<Toast />
		</AKRoutes>
	);
};
