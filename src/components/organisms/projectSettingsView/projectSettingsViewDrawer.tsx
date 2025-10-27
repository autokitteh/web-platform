import React, { useState } from "react";

import { useLocation, useParams } from "react-router-dom";

import { ProjectSettingsConnectionAdd } from "./projectSettingsConnectionAdd";
import { ProjectSettingsConnectionDelete } from "./projectSettingsConnectionDelete";
import { ProjectSettingsConnectionEdit } from "./projectSettingsConnectionEdit";
import { ProjectSettingsTriggerAdd } from "./projectSettingsTriggerAdd";
import { ProjectSettingsTriggerDelete } from "./projectSettingsTriggerDelete";
import { ProjectSettingsTriggerEdit } from "./projectSettingsTriggerEdit";
import { ProjectSettingsVariableAdd } from "./projectSettingsVariableAdd";
import { ProjectSettingsVariableDelete } from "./projectSettingsVariableDelete";
import { ProjectSettingsVariableEdit } from "./projectSettingsVariableEdit";
import { ProjectSettingsView } from "./projectSettingsView";
import { defaultProjectSettingsWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener, useResize } from "@src/hooks";
import { useCacheStore, useDrawerStore, useHasActiveDeployments, useSharedBetweenProjectsStore } from "@src/store";

import { ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

export const ProjectSettingsViewDrawer = () => {
	const location = useLocation();
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const { setProjectSettingsWidth, projectSettingsWidth } = useSharedBetweenProjectsStore();
	const currentProjectSettingsWidth = projectSettingsWidth[projectId!] || defaultProjectSettingsWidth.initial;
	const hasActiveDeployment = useHasActiveDeployments();
	const fetchTriggers = useCacheStore((state) => state.fetchTriggers);
	const fetchVariables = useCacheStore((state) => state.fetchVariables);
	const fetchConnections = useCacheStore((state) => state.fetchConnections);

	// State for operations
	const [operation, setOperation] = useState<{
		action: "add" | "edit" | "delete";
		id?: string;
		type: "connection" | "variable" | "trigger";
	} | null>(null);

	const [drawerWidth] = useResize({
		direction: "horizontal",
		min: defaultProjectSettingsWidth.min,
		max: defaultProjectSettingsWidth.max,
		initial: currentProjectSettingsWidth,
		value: currentProjectSettingsWidth,
		id: "project-config-drawer-resize",
		onChange: (width) => {
			if (projectId) {
				setProjectSettingsWidth(projectId, width);
			}
		},
		invertDirection: true,
	});

	const open = () => {
		if (!projectId) return;
		openDrawer(DrawerName.projectSettings);
		fetchVariables(projectId);
		fetchConnections(projectId);
		fetchTriggers(projectId);
	};

	const close = () => {
		if (!projectId) return;
		closeDrawer(DrawerName.projectSettings);
		setOperation(null);
	};

	const handleOperation = (
		type: "connection" | "variable" | "trigger",
		action: "add" | "edit" | "delete",
		id?: string
	) => {
		setOperation({ type, action, id });
	};

	const handleBackToSettings = () => {
		setOperation(null);
	};

	useEventListener(EventListenerName.displayProjectSettingsSidebar, () => open());

	useEventListener(EventListenerName.hideProjectSettingsSidebar, () => close());

	if (!location.pathname.startsWith("/projects")) {
		return null;
	}

	return (
		<Drawer
			bgTransparent
			className="rounded-r-lg bg-gray-1100 pt-4"
			divId="project-sidebar-config"
			isScreenHeight={false}
			name={DrawerName.projectSettings}
			onCloseCallback={close}
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute"
		>
			{operation?.type === "connection" && operation.action === "add" ? (
				<ProjectSettingsConnectionAdd onBack={handleBackToSettings} />
			) : operation?.type === "connection" && operation.action === "edit" && operation.id ? (
				<ProjectSettingsConnectionEdit connectionId={operation.id} onBack={handleBackToSettings} />
			) : operation?.type === "connection" && operation.action === "delete" && operation.id ? (
				<ProjectSettingsConnectionDelete
					connectionId={operation.id}
					onBack={handleBackToSettings}
					onDelete={() => {
						// Handle delete logic here - for now just go back
						handleBackToSettings();
					}}
				/>
			) : operation?.type === "variable" && operation.action === "add" ? (
				<ProjectSettingsVariableAdd onBack={handleBackToSettings} />
			) : operation?.type === "variable" && operation.action === "edit" && operation.id ? (
				<ProjectSettingsVariableEdit onBack={handleBackToSettings} variableName={operation.id} />
			) : operation?.type === "variable" && operation.action === "delete" && operation.id ? (
				<ProjectSettingsVariableDelete
					onBack={handleBackToSettings}
					onDelete={() => {
						// Handle delete logic here - for now just go back
						handleBackToSettings();
					}}
					variableName={operation.id}
				/>
			) : operation?.type === "trigger" && operation.action === "add" ? (
				<ProjectSettingsTriggerAdd onBack={handleBackToSettings} />
			) : operation?.type === "trigger" && operation.action === "edit" && operation.id ? (
				<ProjectSettingsTriggerEdit onBack={handleBackToSettings} triggerId={operation.id} />
			) : operation?.type === "trigger" && operation.action === "delete" && operation.id ? (
				<ProjectSettingsTriggerDelete
					onBack={handleBackToSettings}
					onDelete={() => {
						// Handle delete logic here - for now just go back
						handleBackToSettings();
					}}
					triggerId={operation.id}
				/>
			) : (
				<ProjectSettingsView
					hasActiveDeployment={hasActiveDeployment}
					key={projectId}
					onClose={close}
					onOperation={handleOperation}
				/>
			)}
			<ResizeButton
				className="absolute left-0 right-auto top-1/2 z-[125] w-2 -translate-y-1/2 cursor-ew-resize px-1 hover:bg-white"
				direction="horizontal"
				id="project-config-drawer-resize-button"
				resizeId="project-config-drawer-resize"
			/>
		</Drawer>
	);
};
