import React from "react";

import { Navigate } from "react-router-dom";

import { MemberRole } from "@enums";
import { legacyRoutes } from "@src/routes.legacy";

import { CreateNewProject, DeploymentsTable, EventViewer, ProtectedRoute, SessionsTable } from "@components/organisms";
import { ProjectSettingsDrawer } from "@components/organisms/configuration";
import { ProjectSettingsMainView } from "@components/organisms/configuration/configurationView";
import { AddConnection, EditConnection } from "@components/organisms/configuration/connections";
import { AddTrigger, EditTrigger } from "@components/organisms/configuration/triggers";
import { AddVariable, EditVariable } from "@components/organisms/configuration/variables";
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
import { ChatPage, CustomError, Dashboard, Internal404, Intro, Project, TemplateLanding } from "@components/pages";
import { AppLayout, EventsLayout } from "@components/templates";
import { ProjectWrapper } from "@components/templates/projectWrapper";
import { SettingsLayout } from "@components/templates/settingsLayout";

const settingsRouteConfig = [
	{ index: true, element: <ProjectSettingsMainView /> },
	{ path: "connections/new", element: <AddConnection /> },
	{ path: "connections", element: <ProjectSettingsMainView /> },
	{ path: "connections/:id/edit", element: <EditConnection /> },
	{ path: "variables", element: <ProjectSettingsMainView /> },
	{ path: "variables/new", element: <AddVariable /> },
	{ path: "variables/:name/edit", element: <EditVariable /> },
	{ path: "triggers", element: <ProjectSettingsMainView /> },
	{ path: "triggers/new", element: <AddTrigger /> },
	{ path: "triggers/:id/edit", element: <EditTrigger /> },
];

export const mainRoutes = [
	{
		path: "/",
		element: <AppLayout hideTopbar />,
		children: [
			{ index: true, element: <Dashboard /> },
			{ path: "ai", element: <CreateNewProject /> },
			{ path: "welcome", element: <CreateNewProject isWelcomePage /> },
			{ path: "intro", element: <Intro /> },
			{ path: "templates-library", element: <TemplatesCatalog fullScreen /> },
			{ path: "404", element: <Internal404 /> },
			{ path: "chat", element: <ChatPage /> },
			{ path: "*", element: <Navigate replace to="/404" /> },
		],
	},
	{
		path: "/template",
		element: <AppLayout hideSystemLog hideTopbar />,
		children: [
			{ index: true, element: <TemplateLanding /> },
			{ path: "*", element: <Navigate replace to="/404" /> },
		],
	},
	{
		path: "projects",
		element: <AppLayout />,
		children: [
			{
				path: ":projectId",
				element: <ProjectWrapper />,
				children: [
					{ index: true, element: <Navigate replace to="explorer" /> },
					{ path: "code", element: <Navigate relative="route" replace to="explorer" /> },
					{
						path: "explorer",
						element: <Project />,
						children: [
							{
								path: "settings",
								element: <ProjectSettingsDrawer />,
								children: settingsRouteConfig,
							},
						],
					},
				],
			},
		],
	},
	{
		path: "projects/:projectId/deployments",
		element: <AppLayout />,
		children: [
			{
				element: <ProjectWrapper />,
				children: [
					{ index: true, element: <DeploymentsTable /> },
					{
						path: "settings",
						element: (
							<>
								<DeploymentsTable />
								<ProjectSettingsDrawer />
							</>
						),
						children: settingsRouteConfig,
					},

					{
						path: ":deploymentId/sessions/settings",
						element: (
							<>
								<SessionsTable />
								<ProjectSettingsDrawer />
							</>
						),
						children: settingsRouteConfig,
					},

					{
						path: ":deploymentId/sessions",
						element: <SessionsTable />,
						children: [
							{
								path: ":sessionId",
								element: <SessionViewer />,
								children: [
									{ index: true, element: <SessionOutputs /> },
									{ path: "executionflow", element: <ActivityList /> },
									{
										path: "settings",
										element: (
											<>
												<SessionOutputs />
												<ProjectSettingsDrawer />
											</>
										),
										children: settingsRouteConfig,
									},
								],
							},
						],
					},

					{ path: "*", element: <Navigate replace to="/404" /> },
				],
			},
		],
	},
	{
		path: "projects/:projectId",
		element: <AppLayout />,
		children: [
			{
				element: <ProjectWrapper />,
				children: [
					{
						path: "sessions/settings",
						element: (
							<>
								<SessionsTable />
								<ProjectSettingsDrawer />
							</>
						),
						children: settingsRouteConfig,
					},
					{
						path: "sessions",
						element: <SessionsTable />,
						children: [
							{
								path: ":sessionId",
								element: <SessionViewer />,
								children: [
									{ index: true, element: <SessionOutputs /> },
									{ path: "executionflow", element: <ActivityList /> },
									{
										path: "settings",
										element: (
											<>
												<SessionOutputs />
												<ProjectSettingsDrawer />
											</>
										),
										children: settingsRouteConfig,
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		path: "settings",
		element: (
			<ProtectedRoute allowedRole={[MemberRole.admin, MemberRole.user]}>
				<SettingsLayout />
			</ProtectedRoute>
		),
		children: [
			{ index: true, element: <Profile /> },
			{ path: "client-configuration", element: <ClientConfiguration /> },
			{ path: "organizations", element: <UserOrganizationsTable /> },
			{ path: "add-organization", element: <AddOrganization /> },
			{ path: "*", element: <Navigate replace to="/404" /> },
		],
	},
	{
		path: "organization-settings",
		element: (
			<ProtectedRoute allowedRole={[MemberRole.admin, MemberRole.user]}>
				<SettingsLayout />
			</ProtectedRoute>
		),
		children: [
			{
				index: true,
				element: (
					<ProtectedRoute allowedRole={[MemberRole.admin]}>
						<OrganizationSettings />
					</ProtectedRoute>
				),
			},
			{
				path: "billing",
				element: (
					<ProtectedRoute allowedRole={[MemberRole.admin]}>
						<OrganizationBilling />
					</ProtectedRoute>
				),
			},
			{ path: "members", element: <OrganizationMembersTable /> },
			{ path: "*", element: <Navigate replace to="/404" /> },
		],
	},
	{
		element: <EventsLayout />,
		children: [
			{
				path: "events",
				element: <EventsList isDrawer={false} />,
				children: [{ path: ":eventId", element: <EventViewer /> }],
			},
			{ path: "*", element: <Navigate replace to="/404" /> },
		],
	},
	{
		path: "switch-organization/:organizationId",
		element: <AppLayout hideTopbar />,
		children: [{ index: true, element: <SwitchOrganization /> }],
	},
	{
		path: "error",
		element: <AppLayout hideTopbar />,
		children: [{ index: true, element: <CustomError /> }],
	},
	...legacyRoutes,
	{ path: "*", element: <Navigate replace to="/404" /> },
];
