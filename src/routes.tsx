import React from "react";

import { Navigate } from "react-router-dom";

import { featureFlags } from "./constants";
import { MemberRole } from "@enums";
import { EventsList } from "@shared-components";
import { legacyRoutes } from "@src/routes.legacy";

import {
	DeploymentsTable,
	EventViewer,
	ProtectedRoute,
	SessionsTable,
	OrgConnectionsTable,
} from "@components/organisms";
import { AddConnection, EditConnection } from "@components/organisms/configuration/connections";
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
import { WelcomePage } from "@components/organisms/welcome";
import {
	AiLandingPage,
	ChatPage,
	CustomError,
	Internal404,
	Intro,
	Project,
	StatisticsDashboard,
	TemplateLanding,
} from "@components/pages";
import { AppLayout, EventsLayout, OrgConnectionsLayout } from "@components/templates";
import { ProjectWrapper } from "@components/templates/projectWrapper";
import { SettingsLayout } from "@components/templates/settingsLayout";

const sessionViewRoutes = [
	{ index: true, element: <SessionOutputs /> },
	{ path: "executionflow", element: <ActivityList /> },
	{ path: "settings/*", element: <SessionOutputs /> },
	{ path: "executionflow/settings/*", element: <ActivityList /> },
];

const sessionRouteConfig = [
	{
		path: ":sessionId",
		element: <SessionViewer />,
		children: sessionViewRoutes,
	},
];

const noProjectHome = featureFlags.displayChatbot ? <AiLandingPage /> : <WelcomePage />;

const orgConnectionsRoutes = [
	{
		element: <OrgConnectionsLayout />,
		children: [
			{
				path: "connections",
				element: <OrgConnectionsTable />,
				children: [
					{ path: "new", element: <AddConnection isDrawerMode={false} isOrgConnection /> },
					{ path: ":id", element: null },
					{
						path: ":id/edit",
						element: <EditConnection isDrawerMode={false} isOrgConnection onXcloseGoBack />,
					},
				],
			},
			{ path: "*", element: <Navigate replace to="/404" /> },
		],
	},
];

export const mainRoutes = [
	{
		path: "/",
		element: <AppLayout hideTopbar />,
		children: [
			{ index: true, element: <StatisticsDashboard /> },
			{ path: "ai", element: noProjectHome },
			{ path: "welcome", element: noProjectHome },
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
		path: "projects/:projectId",
		element: <AppLayout />,
		children: [
			{
				element: <ProjectWrapper />,
				children: [
					{ index: true, element: <Navigate replace to="explorer" /> },
					{ path: "code", element: <Navigate relative="route" replace to="explorer" /> },
					{ path: "explorer", element: <Project /> },
					{ path: "explorer/settings/*", element: <Project /> },
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
					{ path: "settings/*", element: <DeploymentsTable /> },
					{
						path: ":deploymentId/sessions",
						element: <SessionsTable />,
						children: sessionRouteConfig,
					},
					{ path: "*", element: <Navigate replace to="/404" /> },
				],
			},
		],
	},
	{
		path: "projects/:projectId/sessions",
		element: <AppLayout />,
		children: [
			{
				element: <ProjectWrapper />,
				children: [
					{ index: true, element: <SessionsTable /> },
					{ path: "settings/*", element: <SessionsTable /> },
					{
						element: <SessionsTable />,
						children: sessionRouteConfig,
					},
					{ path: "*", element: <Navigate replace to="/404" /> },
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
	...orgConnectionsRoutes,
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
