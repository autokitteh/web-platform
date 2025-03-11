import React, { useEffect } from "react";

import * as Sentry from "@sentry/react";
import ga4 from "react-ga4";
import { useTranslation } from "react-i18next";
import {
	Navigate,
	Route,
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router-dom";

import { AKRoutes, googleAnalyticsId, isProduction, sentryDsn } from "@constants";
import { MemberRole } from "@enums";

import { PageTitle } from "@components/atoms";
import { DeploymentsTable, EventViewer, ProtectedRoute, SessionsTable } from "@components/organisms";
import { CodeTable } from "@components/organisms/code";
import { ConnectionsTable, EditConnection } from "@components/organisms/connections";
import { AddConnection } from "@components/organisms/connections/add";
import { TemplatesCatalog } from "@components/organisms/dashboard/templates";
import { SessionViewer } from "@components/organisms/deployments";
import { ActivityList, SessionOutputs } from "@components/organisms/deployments/sessions/tabs";
import {
	AddOrganization,
	OrganizationMembersTable,
	OrganizationSettings,
	SwitchOrganization,
} from "@components/organisms/settings/organization";
import { ClientConfiguration, Profile, UserOrganizationsTable } from "@components/organisms/settings/user";
import { EventsList } from "@components/organisms/shared";
import { AddTrigger, EditTrigger, TriggersTable } from "@components/organisms/triggers";
import { AddVariable, EditVariable, VariablesTable } from "@components/organisms/variables";
import {
	Connections,
	CustomError,
	Dashboard,
	Internal404,
	Intro,
	Project,
	Triggers,
	Variables,
	TemplateLanding,
} from "@components/pages";
import { AppLayout, EventsLayout } from "@components/templates";
import { SettingsLayout } from "@components/templates/settingsLayout";

export const App = () => {
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const location = useLocation();

	useEffect(() => {
		if (isProduction && googleAnalyticsId) {
			ga4.initialize(googleAnalyticsId, {
				testMode: !isProduction,
			});
		}
	}, []);

	useEffect(() => {
		const path = location.pathname + location.search;
		ga4.send({
			hitType: "pageview",
			page: path,
		});
	}, [location]);

	if (isProduction) {
		Sentry.init({
			dsn: sentryDsn,
			integrations: [
				// See docs for support of different versions of variation of react router
				// https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
				Sentry.reactRouterV7BrowserTracingIntegration({
					useEffect,
					useLocation,
					useNavigationType,
					createRoutesFromChildren,
					matchRoutes,
				}),
				Sentry.feedbackIntegration({
					colorScheme: "system",
					autoInject: false,
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
							<PageTitle title={t("intro", { page: t("intro") })} />
							<TemplatesCatalog fullScreen />
						</>
					}
					path="templates-library"
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
			<Route element={<AppLayout hideSystemLog hideTopbar />} path="/template">
				<Route element={<TemplateLanding />} index />
				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route element={<AppLayout />} path="projects">
				<Route element={<Project />} path=":projectId">
					<Route element={<EventsList isDrawer type="project" />} path="events">
						<Route
							element={
								<>
									<ConnectionsTable />
									<EventsList isDrawer type="project" />
								</>
							}
							path=":eventId"
						/>
					</Route>
					<Route element={<Navigate replace to="code" />} index />

					<Route element={<Connections />} path="connections">
						<Route element={<ConnectionsTable />} index />

						<Route element={<AddConnection />} path="add" />

						<Route element={<EditConnection />} path=":connectionId/edit" />
						<Route
							element={
								<>
									<ConnectionsTable />
									<EventsList isDrawer type="connections" />
								</>
							}
							path=":connectionId/events"
						>
							<Route
								element={
									<>
										<ConnectionsTable />
										<EventsList isDrawer type="connections" />
									</>
								}
								path=":eventId"
							/>
						</Route>

						<Route element={<Navigate replace to="/404" />} path="*" />
					</Route>

					<Route element={<CodeTable />} path="code" />

					<Route element={<Triggers />} path="triggers">
						<Route element={<TriggersTable />} index />

						<Route element={<AddTrigger />} path="add" />

						<Route element={<EditTrigger />} path=":triggerId/edit" />
						<Route
							element={
								<>
									<TriggersTable />
									<EventsList isDrawer type="triggers" />
								</>
							}
							path=":triggerId/events"
						>
							<Route
								element={
									<>
										<TriggersTable />
										<EventsList isDrawer type="triggers" />
									</>
								}
								path=":eventId"
							/>
						</Route>

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
				<Route element={<SessionsTable />} path=":deploymentId/sessions">
					<Route element={<SessionViewer />} path=":sessionId">
						<Route element={<SessionOutputs />} index />
						<Route element={<ActivityList />} path="executionflow" />
					</Route>
				</Route>
				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route element={<AppLayout />} path="projects/:projectId">
				<Route element={<SessionsTable />} path="sessions">
					<Route element={<SessionViewer />} path=":sessionId">
						<Route element={<SessionOutputs />} index />
						<Route element={<ActivityList />} path="executionflow" />
					</Route>
				</Route>
				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route
				element={
					<ProtectedRoute allowedRole={[MemberRole.admin, MemberRole.user]}>
						<SettingsLayout />
					</ProtectedRoute>
				}
				path="settings"
			>
				<Route element={<Profile />} index />
				<Route element={<ClientConfiguration />} path="client-configuration" />
				<Route element={<UserOrganizationsTable />} path="organizations" />
				<Route element={<AddOrganization />} path="add-organization" />

				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route
				element={
					<ProtectedRoute allowedRole={[MemberRole.admin]}>
						<SettingsLayout />
					</ProtectedRoute>
				}
				path="organization-settings"
			>
				<Route element={<OrganizationSettings />} index />
				<Route element={<OrganizationMembersTable />} path="members" />

				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route element={<EventsLayout />}>
				<Route element={<EventsList isDrawer={false} />} path="events">
					<Route element={<EventViewer />} path=":eventId" />
				</Route>

				<Route element={<Navigate replace to="/404" />} path="*" />
			</Route>

			<Route element={<Navigate replace to="/404" />} path="*" />

			<Route element={<AppLayout hideTopbar />} path="switch-organization/:organizationId">
				<Route element={<SwitchOrganization />} index />
			</Route>

			<Route element={<AppLayout hideTopbar />} path="error">
				<Route element={<CustomError />} index />
			</Route>
		</AKRoutes>
	);
};
