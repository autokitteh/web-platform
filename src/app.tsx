import React from "react";
import { CodeTable } from "@components/organisms/code";
import { ConnectionsTable } from "@components/organisms/connections";
import { AddConnection } from "@components/organisms/connections/add";
import { AddTrigger, EditTrigger, TriggersTable } from "@components/organisms/triggers";
import { AddVariable, EditVariable, VariablesTable } from "@components/organisms/variables";
import { Dashboard, Project, Variables } from "@components/pages";
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
						<Route element={<EditVariable />} path=":variableId/edit" />
					</Route>

					<Route element={<Deployments />} path="deployments" />
				</Route>
			</Route>
		</Routes>
	</BrowserRouter>
);
