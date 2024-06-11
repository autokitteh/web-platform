import React from "react";
import { DeploymentsTable, SessionsTable } from "@components/organisms";
import { CodeTable } from "@components/organisms/code";
import { ConnectionsTable } from "@components/organisms/connections";
import { AddConnection } from "@components/organisms/connections/add";
import { SessionTableEditorFrame } from "@components/organisms/deployments";
import { AddTrigger, DefaultEditTrigger, SchedulerEditTrigger, TriggersTable } from "@components/organisms/triggers";
import { AddVariable, EditVariable, VariablesTable } from "@components/organisms/variables";
import { Dashboard, Project, Sessions, Settings, Variables } from "@components/pages";
import { Triggers } from "@components/pages";
import { Connections } from "@components/pages";
import { Deployments } from "@components/pages/deployments";
import { AppLayout } from "@components/templates";
import { SettingsLayout } from "@components/templates/settingsLayout";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

export const App: React.FC = () => (
	<BrowserRouter>
		<Routes>
			<Route element={<AppLayout />} path="/">
				<Route element={<Dashboard />} index />
			</Route>
			<Route element={<AppLayout displayTopbar />} path="projects">
				<Route element={<Project />} path=":projectId">
					<Route element={<Navigate replace to="code" />} index />
					<Route element={<Connections />} path="connections">
						<Route element={<ConnectionsTable />} index />
						<Route element={<AddConnection />} path="add" />
					</Route>
					<Route element={<CodeTable />} path="code" />

					<Route element={<Triggers />} path="triggers">
						<Route element={<TriggersTable />} index />
						<Route element={<AddTrigger />} path="add" />
						<Route element={<DefaultEditTrigger />} path=":triggerId/edit" />
						<Route element={<SchedulerEditTrigger />} path=":triggerId/edit-scheduler" />
					</Route>

					<Route element={<Variables />} path="variables">
						<Route element={<VariablesTable />} index />
						<Route element={<AddVariable />} path="add" />
						<Route element={<EditVariable />} path="edit/:environmentId/:variableName" />
					</Route>
				</Route>
			</Route>
			<Route element={<AppLayout displayStatsTopbar />} path="projects/:projectId">
				<Route element={<Deployments />} path="deployments">
					<Route element={<DeploymentsTable />} index />
					<Route element={<Sessions />} path=":deploymentId">
						<Route element={<SessionsTable />} path="sessions">
							<Route element={<SessionTableEditorFrame />} path=":sessionId" />
						</Route>
					</Route>
				</Route>
			</Route>

			<Route element={<SettingsLayout />} path="/settings">
				<Route element={<Settings />} index />
			</Route>
		</Routes>
	</BrowserRouter>
);
