import React from "react";
import { CodeTable } from "@components/organisms/code";
import { ConnectionsTable } from "@components/organisms/connections";
import { AddConnection } from "@components/organisms/connections/add";
import { Dashboard, Project } from "@components/pages";
import { Connections } from "@components/pages/connections";
import { AppLayout } from "@components/templates";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export const App: React.FC = () => (
	<BrowserRouter>
		<Routes>
			<Route element={<AppLayout />} path="/">
				<Route element={<Dashboard />} index />
			</Route>
			<Route element={<AppLayout displayTopbar />} path="projects">
				<Route element={<Project />} path=":projectId">
					<Route element={<Connections />} path="connections">
						<Route element={<ConnectionsTable />} index />
						<Route element={<AddConnection />} path="new" />
					</Route>
					<Route element={<CodeTable />} path="code" />
				</Route>
			</Route>
		</Routes>
	</BrowserRouter>
);
