import React, { useEffect, useState } from "react";

import ga4 from "react-ga4";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";

import { googleAnalyticsId, isProduction } from "@constants";
import { MemberRole } from "@enums";
import { useHubspot } from "@src/hooks";
import { getPageTitleFromPath } from "@utilities";

import { useFileStore, useOrganizationStore } from "@store";

import { PageTitle } from "@components/atoms";
import { DeploymentsTable, EventViewer, ProtectedRoute, SessionsTable } from "@components/organisms";
import { CodeTable } from "@components/organisms/code";
import { ConnectionsTable, EditConnectionModal } from "@components/organisms/connections";
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
import { OrganizationBilling } from "@components/organisms/settings/organization/billing";
import { ClientConfiguration, Profile, UserOrganizationsTable } from "@components/organisms/settings/user";
import { EventsList } from "@components/organisms/shared";
import { AddTrigger, EditTrigger, TriggersTable } from "@components/organisms/triggers";
import { AddVariable, EditVariable, VariablesTable } from "@components/organisms/variables";
import {
	AiLandingPage,
	ChatPage,
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
import { ProjectWrapper } from "@components/templates/projectWrapper";
import { SettingsLayout } from "@components/templates/settingsLayout";

export const App = () => {
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const location = useLocation();
	const params = useParams<{
		connectionId?: string;
		deploymentId?: string;
		eventId?: string;
		projectId?: string;
		sessionId?: string;
		triggerId?: string;
	}>();
	const { user, currentOrganization: organization } = useOrganizationStore();

	const { openFiles } = useFileStore();
	const [pageTitle, setPageTitle] = useState<string>(t("base"));
	const { setPathPageView } = useHubspot();

	const activeFile = params.projectId
		? openFiles[params.projectId]?.find((f: { isActive: boolean }) => f.isActive)
		: undefined;
	const activeFileName = activeFile?.name;

	const { pageTitle: pageTitleKey, projectName: extractedProjectName } = getPageTitleFromPath(location.pathname);

	useEffect(() => {
		if (isProduction && googleAnalyticsId) {
			ga4.initialize(googleAnalyticsId, {
				testMode: !isProduction,
			});
		}
	}, []);

	useEffect(() => {
		const trackPageView = async () => {
			const path = location.pathname + location.search;

			ga4.send({
				hitType: "pageview",
				page: path,
			});

			if (user) {
				setPathPageView(location.pathname);
			}

			let newPageTitle = t("template", { page: t(pageTitleKey) });
			if (extractedProjectName) {
				newPageTitle += ` - ${extractedProjectName}`;
			}
			setPageTitle(newPageTitle);
		};

		trackPageView();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname, user, organization, params, pageTitleKey, activeFileName, extractedProjectName]);

	return (
		<>
			<PageTitle title={pageTitle} />
			<Routes>
				<Route element={<AppLayout hideTopbar />} path="/">
					<Route element={<Dashboard />} index />
					<Route element={<AiLandingPage />} path="ai" />
					<Route element={<AiLandingPage />} path="welcome" />

					<Route element={<Intro />} path="intro" />

					<Route element={<TemplatesCatalog fullScreen />} path="templates-library" />

					<Route element={<Internal404 />} path="404" />
					<Route element={<ChatPage />} path="chat" />
					<Route element={<Navigate replace to="/404" />} path="*" />
				</Route>
				<Route element={<AppLayout hideSystemLog hideTopbar />} path="/template">
					<Route element={<TemplateLanding />} index />
					<Route element={<Navigate replace to="/404" />} path="*" />
				</Route>
				<Route element={<AppLayout />} path="projects">
					<Route element={<ProjectWrapper />} path=":projectId">
						<Route element={<Project />} path="">
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
							<Route element={<Navigate replace state={location.state} to="code" />} index />

							<Route element={<Connections />} path="connections">
								<Route element={<ConnectionsTable />} index />

								<Route element={<AddConnection />} path="add" />

								<Route element={<EditConnectionModal />} path=":connectionId/edit" />
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
					</Route>

					<Route element={<Navigate replace to="/404" />} path="*" />
				</Route>
				<Route element={<AppLayout />} path="projects/:projectId/deployments">
					<Route element={<ProjectWrapper />}>
						<Route element={<DeploymentsTable />} index />
						<Route element={<SessionsTable />} path=":deploymentId/sessions">
							<Route element={<SessionViewer />} path=":sessionId">
								<Route element={<SessionOutputs />} index />
								<Route element={<ActivityList />} path="executionflow" />
							</Route>
						</Route>
						<Route element={<Navigate replace to="/404" />} path="*" />
					</Route>
				</Route>
				<Route element={<AppLayout />} path="projects/:projectId">
					<Route element={<ProjectWrapper />}>
						<Route element={<SessionsTable />} path="sessions">
							<Route element={<SessionViewer />} path=":sessionId">
								<Route element={<SessionOutputs />} index />
								<Route element={<ActivityList />} path="executionflow" />
							</Route>
						</Route>
						<Route element={<Navigate replace to="/404" />} path="*" />
					</Route>
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
						<ProtectedRoute allowedRole={[MemberRole.admin, MemberRole.user]}>
							<SettingsLayout />
						</ProtectedRoute>
					}
					path="organization-settings"
				>
					<Route
						element={
							<ProtectedRoute allowedRole={[MemberRole.admin]}>
								<OrganizationSettings />
							</ProtectedRoute>
						}
						index
					/>
					<Route
						element={
							<ProtectedRoute allowedRole={[MemberRole.admin]}>
								<OrganizationBilling />
							</ProtectedRoute>
						}
						path="billing"
					/>
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
			</Routes>
		</>
	);
};
