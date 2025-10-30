import React, { useEffect, useState } from "react";

import ga4 from "react-ga4";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes, useLocation, useParams, Location } from "react-router-dom";

import { googleAnalyticsId, isProduction } from "@constants";
import { MemberRole } from "@enums";
import { useHubspot } from "@src/hooks";
import { getPageTitleFromPath } from "@utilities";

import { useFileStore, useOrganizationStore } from "@store";

import { PageTitle } from "@components/atoms";
import { CreateNewProject, DeploymentsTable, EventViewer, ProtectedRoute, SessionsTable } from "@components/organisms";
import { TemplatesCatalog } from "@components/organisms/dashboard/templates";
import { SessionViewer } from "@components/organisms/deployments";
import { ActivityList, SessionOutputs } from "@components/organisms/deployments/sessions/tabs";
import {
	ProjectSettingsDrawerConnectionAdd,
	ProjectSettingsDrawerConnectionDelete,
	ProjectSettingsDrawerConnectionEdit,
	ProjectSettingsDrawerMain,
	ProjectSettingsDrawerTriggerAdd,
	ProjectSettingsDrawerTriggerDelete,
	ProjectSettingsDrawerTriggerEdit,
	ProjectSettingsDrawerVariableAdd,
	ProjectSettingsDrawerVariableDelete,
	ProjectSettingsDrawerVariableEdit,
} from "@components/organisms/projectSettingsView";
import {
	AddOrganization,
	OrganizationMembersTable,
	OrganizationSettings,
	SwitchOrganization,
} from "@components/organisms/settings/organization";
import { OrganizationBilling } from "@components/organisms/settings/organization/billing";
import { ClientConfiguration, Profile, UserOrganizationsTable } from "@components/organisms/settings/user";
import { EventsList } from "@components/organisms/shared";
import { ChatPage, CustomError, Dashboard, Internal404, Intro, Project, TemplateLanding } from "@components/pages";
import { AppLayout, EventsLayout } from "@components/templates";
import { ProjectWrapper } from "@components/templates/projectWrapper";
import { SettingsLayout } from "@components/templates/settingsLayout";

export const App = () => {
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const location = useLocation();
	const backgroundLocation = (location.state as { backgroundLocation?: Location })?.backgroundLocation;
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
			<Routes location={backgroundLocation || location}>
				<Route element={<AppLayout hideTopbar />} path="/">
					<Route element={<Dashboard />} index />
					<Route element={<CreateNewProject />} path="ai" />
					<Route element={<CreateNewProject isWelcomePage />} path="welcome" />

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
								<Route element={<EventsList isDrawer type="project" />} path=":eventId" />
							</Route>
							<Route element={<Navigate replace to="/404" />} path="*" />
						</Route>
						<Route element={<ProjectSettingsDrawerMain />} path="settings" />
						<Route element={<ProjectSettingsDrawerConnectionAdd />} path="connections/add" />
						<Route
							element={<ProjectSettingsDrawerConnectionEdit />}
							path="connections/:connectionId/edit"
						/>
						<Route
							element={<ProjectSettingsDrawerConnectionDelete />}
							path="connections/:connectionId/delete"
						/>
						<Route element={<ProjectSettingsDrawerVariableAdd />} path="variables/add" />
						<Route element={<ProjectSettingsDrawerVariableEdit />} path="variables/:variableName/edit" />
						<Route
							element={<ProjectSettingsDrawerVariableDelete />}
							path="variables/:variableName/delete"
						/>
						<Route element={<ProjectSettingsDrawerTriggerAdd />} path="triggers/add" />
						<Route element={<ProjectSettingsDrawerTriggerEdit />} path="triggers/:triggerId/edit" />
						<Route element={<ProjectSettingsDrawerTriggerDelete />} path="triggers/:triggerId/delete" />
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
			{backgroundLocation ? (
				<Routes>
					<Route element={<ProjectSettingsDrawerMain />} path="projects/:projectId/settings" />
					<Route
						element={<ProjectSettingsDrawerConnectionAdd />}
						path="projects/:projectId/connections/add"
					/>
					<Route
						element={<ProjectSettingsDrawerConnectionEdit />}
						path="projects/:projectId/connections/:connectionId/edit"
					/>
					<Route
						element={<ProjectSettingsDrawerConnectionDelete />}
						path="projects/:projectId/connections/:connectionId/delete"
					/>
					<Route element={<ProjectSettingsDrawerVariableAdd />} path="projects/:projectId/variables/add" />
					<Route
						element={<ProjectSettingsDrawerVariableEdit />}
						path="projects/:projectId/variables/:variableName/edit"
					/>
					<Route
						element={<ProjectSettingsDrawerVariableDelete />}
						path="projects/:projectId/variables/:variableName/delete"
					/>
					<Route element={<ProjectSettingsDrawerTriggerAdd />} path="projects/:projectId/triggers/add" />
					<Route
						element={<ProjectSettingsDrawerTriggerEdit />}
						path="projects/:projectId/triggers/:triggerId/edit"
					/>
					<Route
						element={<ProjectSettingsDrawerTriggerDelete />}
						path="projects/:projectId/triggers/:triggerId/delete"
					/>
				</Routes>
			) : null}
		</>
	);
};
