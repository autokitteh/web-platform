import React from "react";
import { DeploymentsTable, SessionsTable } from "@components/organisms";
import { CodeTable } from "@components/organisms/code";
import { ConnectionsTable } from "@components/organisms/connections";
import { AddConnection } from "@components/organisms/connections/add";
import { SessionTableEditorFrame } from "@components/organisms/deployments";
import { AddTrigger, EditTrigger, TriggersTable } from "@components/organisms/triggers";
import { AddVariable, EditVariable, VariablesTable } from "@components/organisms/variables";
import { Dashboard, Project, Sessions, Variables } from "@components/pages";
import { Triggers } from "@components/pages";
import { Connections } from "@components/pages";
import { Deployments } from "@components/pages/deployments";
import { AppLayout } from "@components/templates";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

export const App: React.FC = () => (
	<BrowserRouter>
		<Routes>
			<Route element={<AppLayout />} path="/">
				<Route element={<Dashboard />} index />
			</Route>
			<Route element={<AppLayout displayTopbar />} path="projects">
				<Route element={<Project />} path=":projectId">
					<Route element={<Navigate to="code" />} index />
					<Route element={<Connections />} path="connections">
						<Route element={<ConnectionsTable />} index />
						<Route element={<AddConnection />} path="add" />
					</Route>
					<Route element={<CodeTable />} path="code" />

					<Route element={<Triggers />} path="triggers">
						<Route element={<TriggersTable />} index />
						<Route element={<AddTrigger />} path="add" />
						<Route element={<EditTrigger />} path=":triggerId/edit" />
					</Route>

					<Route element={<Variables />} path="variables">
						<Route element={<VariablesTable />} index />
						<Route element={<AddVariable />} path="add" />
						<Route element={<EditVariable />} path="edit/:environmentId/:variableName" />
					</Route>
				</Route>
			</Route>
			<Route element={<AppLayout displayStatsTopbar />} path="projects/:projectId/stats">
				<Route element={<Deployments />} path="deployments">
					<Route element={<DeploymentsTable />} index />
					<Route element={<Sessions />} path=":deploymentId">
						<Route element={<SessionsTable />} path="sessions">
							<Route element={<SessionTableEditorFrame />} path=":sessionId" />
						</Route>
					</Route>
				</Route>
				<Route element={<Navigate to="deployments" />} index />
			</Route>
		</Routes>
	</BrowserRouter>
);
