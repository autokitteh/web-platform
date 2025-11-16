import React from "react";

import { Navigate, useParams } from "react-router-dom";

import { AppLayout } from "@components/templates";

/**
 * Legacy Route Redirects
 *
 * This file maintains backward compatibility with old route paths that have been
 * refactored in the new project structure. All old routes are redirected to their
 * new equivalents.
 *
 * Migration Summary:
 * - Project code view: `/projects/:projectId/code` → `/projects/:projectId/explorer`
 * - Settings moved to drawer: Flat paths → nested under `/projects/:projectId/explorer/settings`
 * - Add operations: `/add` → `/new`
 * - Connection IDs: `:connectionId` → `:id`
 * - New delete operations added
 */

// eslint-disable-next-line react-refresh/only-export-components
const CodeRedirect = () => {
	const { projectId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const ConnectionsRedirect = () => {
	const { projectId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/settings/connections`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const ConnectionsAddRedirect = () => {
	const { projectId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/settings/connections/new`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const ConnectionEditRedirect = () => {
	const { projectId, connectionId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/settings/connections/${connectionId}/edit`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const ConnectionEventsRedirect = () => {
	const { projectId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/events`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const ConnectionEventDetailRedirect = () => {
	const { projectId, eventId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/events/${eventId}`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const TriggersRedirect = () => {
	const { projectId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/settings/triggers`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const TriggersAddRedirect = () => {
	const { projectId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/settings/triggers/new`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const TriggerEditRedirect = () => {
	const { projectId, triggerId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/settings/triggers/${triggerId}/edit`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const TriggerEventsRedirect = () => {
	const { projectId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/events`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const TriggerEventDetailRedirect = () => {
	const { projectId, eventId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/events/${eventId}`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const VariablesRedirect = () => {
	const { projectId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/settings/variables`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const VariablesAddRedirect = () => {
	const { projectId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/settings/variables/new`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const VariableEditRedirect = () => {
	const { projectId, variableName } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/settings/variables/${variableName}/edit`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const EventsRedirect = () => {
	const { projectId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/events`} />;
};

// eslint-disable-next-line react-refresh/only-export-components
const EventDetailRedirect = () => {
	const { projectId, eventId } = useParams();
	return <Navigate replace to={`/projects/${projectId}/explorer/events/${eventId}`} />;
};

export const legacyRoutes = [
	{
		element: <AppLayout />,
		children: [
			// Code view redirect to explorer
			{
				path: "projects/:projectId/code",
				element: <CodeRedirect />,
			},

			// Old connections routes
			{
				path: "projects/:projectId/connections",
				element: <ConnectionsRedirect />,
			},
			{
				path: "projects/:projectId/connections/add",
				element: <ConnectionsAddRedirect />,
			},
			{
				path: "projects/:projectId/connections/:connectionId/edit",
				element: <ConnectionEditRedirect />,
			},
			{
				path: "projects/:projectId/connections/:connectionId/events",
				element: <ConnectionEventsRedirect />,
			},
			{
				path: "projects/:projectId/connections/:connectionId/events/:eventId",
				element: <ConnectionEventDetailRedirect />,
			},

			// Old triggers routes
			{
				path: "projects/:projectId/triggers",
				element: <TriggersRedirect />,
			},
			{
				path: "projects/:projectId/triggers/add",
				element: <TriggersAddRedirect />,
			},
			{
				path: "projects/:projectId/triggers/:triggerId/edit",
				element: <TriggerEditRedirect />,
			},
			{
				path: "projects/:projectId/triggers/:triggerId/events",
				element: <TriggerEventsRedirect />,
			},
			{
				path: "projects/:projectId/triggers/:triggerId/events/:eventId",
				element: <TriggerEventDetailRedirect />,
			},

			// Old variables routes
			{
				path: "projects/:projectId/variables",
				element: <VariablesRedirect />,
			},
			{
				path: "projects/:projectId/variables/add",
				element: <VariablesAddRedirect />,
			},
			{
				path: "projects/:projectId/variables/edit/:variableName",
				element: <VariableEditRedirect />,
			},

			// Old events routes (now nested under explorer)
			{
				path: "projects/:projectId/events",
				element: <EventsRedirect />,
			},
			{
				path: "projects/:projectId/events/:eventId",
				element: <EventDetailRedirect />,
			},
		],
	},
];

/**
 * Path Mapping Reference
 *
 * OLD PATH → NEW PATH
 *
 * Code View:
 * /projects/:projectId/code → /projects/:projectId/explorer
 *
 * Connections:
 * /projects/:projectId/connections → /projects/:projectId/explorer/settings/connections
 * /projects/:projectId/connections/add → /projects/:projectId/explorer/settings/connections/new
 * /projects/:projectId/connections/:connectionId/edit → /projects/:projectId/explorer/settings/connections/:connectionId/edit
 * /projects/:projectId/connections/:connectionId/events → /projects/:projectId/explorer/events
 * /projects/:projectId/connections/:connectionId/events/:eventId → /projects/:projectId/explorer/events/:eventId
 *
 * Triggers:
 * /projects/:projectId/triggers → /projects/:projectId/explorer/settings/triggers
 * /projects/:projectId/triggers/add → /projects/:projectId/explorer/settings/triggers/new
 * /projects/:projectId/triggers/:triggerId/edit → /projects/:projectId/explorer/settings/triggers/:triggerId/edit
 * /projects/:projectId/triggers/:triggerId/events → /projects/:projectId/explorer/events
 * /projects/:projectId/triggers/:triggerId/events/:eventId → /projects/:projectId/explorer/events/:eventId
 *
 * Variables:
 * /projects/:projectId/variables → /projects/:projectId/explorer/settings/variables
 * /projects/:projectId/variables/add → /projects/:projectId/explorer/settings/variables/new
 * /projects/:projectId/variables/edit/:variableName → /projects/:projectId/explorer/settings/variables/:variableName/edit
 *
 * Events:
 * /projects/:projectId/events → /projects/:projectId/explorer/events
 * /projects/:projectId/events/:eventId → /projects/:projectId/explorer/events/:eventId
 */
