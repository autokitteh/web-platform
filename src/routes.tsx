import React, { Suspense, lazy } from "react";

import { Navigate } from "react-router-dom";

import { featureFlags } from "./constants";
import { MemberRole } from "@enums";
import { legacyRoutes } from "@src/routes.legacy";

import { PageLoader } from "@components/atoms";
import { ProtectedRoute } from "@components/organisms";
import { AppLayout, EventsLayout, GlobalConnectionsLayout } from "@components/templates";
import { ProjectWrapper } from "@components/templates/projectWrapper";
import { SettingsLayout } from "@components/templates/settingsLayout";

const LazyDashboard = lazy(() => import("@components/pages/dashboard").then((m) => ({ default: m.Dashboard })));
const LazyProject = lazy(() => import("@components/pages/project").then((m) => ({ default: m.Project })));
const LazyAiLandingPage = lazy(() =>
	import("@components/pages/aiLandingPage").then((m) => ({ default: m.AiLandingPage }))
);
const LazyChatPage = lazy(() => import("@components/pages/chat").then((m) => ({ default: m.ChatPage })));
const LazyIntro = lazy(() => import("@components/pages/intro").then((m) => ({ default: m.Intro })));
const LazyTemplateLanding = lazy(() =>
	import("@components/pages/templateLanding").then((m) => ({ default: m.TemplateLanding }))
);
const LazyCustomError = lazy(() => import("@components/pages/customError").then((m) => ({ default: m.CustomError })));
const LazyInternal404 = lazy(() => import("@components/pages/internal404").then((m) => ({ default: m.Internal404 })));

const LazyDeploymentsTable = lazy(() =>
	import("@components/organisms/deployments/table").then((m) => ({ default: m.DeploymentsTable }))
);
const LazySessionsTable = lazy(() =>
	import("@components/organisms/deployments/sessions/table/table").then((m) => ({ default: m.SessionsTable }))
);
const LazySessionViewer = lazy(() =>
	import("@components/organisms/deployments/sessions/viewer").then((m) => ({ default: m.SessionViewer }))
);
const LazyEventViewer = lazy(() =>
	import("@components/organisms/events/viewer").then((m) => ({ default: m.EventViewer }))
);
const LazyEventsList = lazy(() =>
	import("@components/organisms/shared/events").then((m) => ({ default: m.EventsList }))
);
const GlobalConnectionsTable = lazy(() =>
	import("@components/organisms/globalConnections/table").then((m) => ({
		default: m.GlobalConnectionsTable,
	}))
);

const LazyProjectConfigurationDrawer = lazy(() =>
	import("@components/organisms/configuration/configrationDrawer").then((m) => ({
		default: m.ProjectConfigurationDrawer,
	}))
);
const LazyProjectConfigurationView = lazy(() =>
	import("@components/organisms/configuration/configurationView").then((m) => ({
		default: m.ConfigurationView,
	}))
);
const LazyAddConnection = lazy(() =>
	import("@components/organisms/configuration/connections/add").then((m) => ({ default: m.AddConnection }))
);
const LazyEditConnection = lazy(() =>
	import("@components/organisms/configuration/connections/edit").then((m) => ({
		default: m.EditConnection,
	}))
);
const LazyAddTrigger = lazy(() =>
	import("@components/organisms/configuration/triggers/add").then((m) => ({ default: m.AddTrigger }))
);
const LazyEditTrigger = lazy(() =>
	import("@components/organisms/configuration/triggers/edit").then((m) => ({ default: m.EditTrigger }))
);
const LazyAddVariable = lazy(() =>
	import("@components/organisms/configuration/variables/add").then((m) => ({ default: m.AddVariable }))
);
const LazyEditVariable = lazy(() =>
	import("@components/organisms/configuration/variables/edit").then((m) => ({ default: m.EditVariable }))
);

const LazyTemplatesCatalog = lazy(() =>
	import("@components/organisms/dashboard/templates/catalog").then((m) => ({ default: m.TemplatesCatalog }))
);
const LazyWelcomePage = lazy(() => import("@components/organisms/welcome").then((m) => ({ default: m.WelcomePage })));

const LazyActivityList = lazy(() =>
	import("@components/organisms/deployments/sessions/tabs/activities").then((m) => ({ default: m.ActivityList }))
);
const LazySessionOutputs = lazy(() =>
	import("@components/organisms/deployments/sessions/tabs/outputs").then((m) => ({
		default: m.SessionOutputs,
	}))
);

const LazyProfile = lazy(() =>
	import("@components/organisms/settings/user/profile").then((m) => ({ default: m.Profile }))
);
const LazyClientConfiguration = lazy(() =>
	import("@components/organisms/settings/user/clientConfiguration").then((m) => ({
		default: m.ClientConfiguration,
	}))
);
const LazyUserOrganizationsTable = lazy(() =>
	import("@components/organisms/settings/user/organizations/table").then((m) => ({
		default: m.UserOrganizationsTable,
	}))
);
const LazyAddOrganization = lazy(() =>
	import("@components/organisms/settings/organization/add").then((m) => ({
		default: m.AddOrganization,
	}))
);
const LazyOrganizationSettings = lazy(() =>
	import("@components/organisms/settings/organization/settings").then((m) => ({ default: m.OrganizationSettings }))
);
const LazyOrganizationMembersTable = lazy(() =>
	import("@components/organisms/settings/organization/members/table").then((m) => ({
		default: m.OrganizationMembersTable,
	}))
);
const LazySwitchOrganization = lazy(() =>
	import("@components/organisms/settings/organization/switchOrganization").then((m) => ({
		default: m.SwitchOrganization,
	}))
);
const LazyOrganizationBilling = lazy(() =>
	import("@components/organisms/settings/organization/billing/organizationBilling").then((m) => ({
		default: m.OrganizationBilling,
	}))
);

const withSuspense = (Component: React.ReactNode) => <Suspense fallback={<PageLoader />}>{Component}</Suspense>;

const settingsRouteConfig = [
	{ index: true, element: withSuspense(<LazyProjectConfigurationView />) },
	{ path: "connections/new", element: withSuspense(<LazyAddConnection isDrawerMode isGlobalConnection={false} />) },
	{ path: "connections", element: withSuspense(<LazyProjectConfigurationView />) },
	{
		path: "connections/:id/edit",
		element: withSuspense(<LazyEditConnection isDrawerMode isGlobalConnection={false} />),
	},
	{ path: "variables", element: withSuspense(<LazyProjectConfigurationView />) },
	{ path: "variables/new", element: withSuspense(<LazyAddVariable />) },
	{ path: "variables/:name/edit", element: withSuspense(<LazyEditVariable />) },
	{ path: "triggers", element: withSuspense(<LazyProjectConfigurationView />) },
	{ path: "triggers/new", element: withSuspense(<LazyAddTrigger />) },
	{ path: "triggers/:id/edit", element: withSuspense(<LazyEditTrigger />) },
];

const noProjectHome = featureFlags.displayChatbot
	? withSuspense(<LazyAiLandingPage />)
	: withSuspense(<LazyWelcomePage />);

const globalConnectionsRoutes = featureFlags.displayGlobalConnections
	? [
			{
				element: <GlobalConnectionsLayout />,
				children: [
					{
						path: "connections",
						element: withSuspense(<GlobalConnectionsTable />),
						children: [
							{
								path: "new",
								element: withSuspense(
									<LazyAddConnection isDrawerMode={false} isGlobalConnection={true} />
								),
							},
							{ path: ":id", element: null },
							{
								path: ":id/edit",
								element: withSuspense(
									<LazyEditConnection isDrawerMode={false} isGlobalConnection={true} onXcloseGoBack />
								),
							},
						],
					},
					{ path: "*", element: <Navigate replace to="/404" /> },
				],
			},
		]
	: [];

export const mainRoutes = [
	{
		path: "/",
		element: <AppLayout hideTopbar />,
		children: [
			{ index: true, element: withSuspense(<LazyDashboard />) },
			{ path: "ai", element: noProjectHome },
			{ path: "welcome", element: noProjectHome },
			{ path: "intro", element: withSuspense(<LazyIntro />) },
			{ path: "templates-library", element: withSuspense(<LazyTemplatesCatalog fullScreen />) },
			{ path: "404", element: withSuspense(<LazyInternal404 />) },
			{ path: "chat", element: withSuspense(<LazyChatPage />) },
			{ path: "*", element: <Navigate replace to="/404" /> },
		],
	},
	{
		path: "/template",
		element: <AppLayout hideSystemLog hideTopbar />,
		children: [
			{ index: true, element: withSuspense(<LazyTemplateLanding />) },
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
					{
						path: "explorer",
						element: withSuspense(<LazyProject />),
						children: [
							{
								path: "settings",
								element: withSuspense(<LazyProjectConfigurationDrawer />),
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
					{ index: true, element: withSuspense(<LazyDeploymentsTable />) },
					{
						path: "settings",
						element: withSuspense(
							<>
								<LazyDeploymentsTable />
								<LazyProjectConfigurationDrawer />
							</>
						),
						children: settingsRouteConfig,
					},

					{
						path: ":deploymentId/sessions/settings",
						element: withSuspense(
							<>
								<LazySessionsTable />
								<LazyProjectConfigurationDrawer />
							</>
						),
						children: settingsRouteConfig,
					},

					{
						path: ":deploymentId/sessions",
						element: withSuspense(<LazySessionsTable />),
						children: [
							{
								path: ":sessionId",
								element: withSuspense(<LazySessionViewer />),
								children: [
									{ index: true, element: withSuspense(<LazySessionOutputs />) },
									{ path: "executionflow", element: withSuspense(<LazyActivityList />) },
									{
										path: "settings",
										element: withSuspense(
											<>
												<LazySessionOutputs />
												<LazyProjectConfigurationDrawer />
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
		path: "projects/:projectId/sessions",
		element: <AppLayout />,
		children: [
			{
				element: <ProjectWrapper />,
				children: [
					{ index: true, element: withSuspense(<LazySessionsTable />) },
					{ path: "settings/*", element: withSuspense(<LazySessionsTable />) },
					{
						element: withSuspense(<LazySessionsTable />),
						children: [
							{
								path: ":sessionId",
								element: withSuspense(<LazySessionViewer />),
								children: [
									{ index: true, element: withSuspense(<LazySessionOutputs />) },
									{ path: "executionflow", element: withSuspense(<LazyActivityList />) },
									{ path: "settings/*", element: withSuspense(<LazySessionOutputs />) },
									{ path: "executionflow/settings/*", element: withSuspense(<LazyActivityList />) },
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
		path: "settings",
		element: (
			<ProtectedRoute allowedRole={[MemberRole.admin, MemberRole.user]}>
				<SettingsLayout />
			</ProtectedRoute>
		),
		children: [
			{ index: true, element: withSuspense(<LazyProfile />) },
			{ path: "client-configuration", element: withSuspense(<LazyClientConfiguration />) },
			{ path: "organizations", element: withSuspense(<LazyUserOrganizationsTable />) },
			{ path: "add-organization", element: withSuspense(<LazyAddOrganization />) },
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
						{withSuspense(<LazyOrganizationSettings />)}
					</ProtectedRoute>
				),
			},
			{
				path: "billing",
				element: (
					<ProtectedRoute allowedRole={[MemberRole.admin]}>
						{withSuspense(<LazyOrganizationBilling />)}
					</ProtectedRoute>
				),
			},
			{ path: "members", element: withSuspense(<LazyOrganizationMembersTable />) },
			{ path: "*", element: <Navigate replace to="/404" /> },
		],
	},
	{
		element: <EventsLayout />,
		children: [
			{
				path: "events",
				element: withSuspense(<LazyEventsList isDrawer={false} />),
				children: [{ path: ":eventId", element: withSuspense(<LazyEventViewer />) }],
			},
			{ path: "*", element: <Navigate replace to="/404" /> },
		],
	},
	...globalConnectionsRoutes,
	{
		path: "switch-organization/:organizationId",
		element: <AppLayout hideTopbar />,
		children: [{ index: true, element: withSuspense(<LazySwitchOrganization />) }],
	},
	{
		path: "error",
		element: <AppLayout hideTopbar />,
		children: [{ index: true, element: withSuspense(<LazyCustomError />) }],
	},
	...legacyRoutes,
	{ path: "*", element: <Navigate replace to="/404" /> },
];
