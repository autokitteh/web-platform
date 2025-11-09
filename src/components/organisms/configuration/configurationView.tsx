import React, { useEffect, useRef, useState } from "react";

import { useLocation, useParams } from "react-router-dom";

import { Connections } from "./connections";
import { Triggers } from "./triggers";
import { Variables } from "./variables";
import { DrawerName } from "@src/enums/components";
import { useCacheStore, useSharedBetweenProjectsStore } from "@src/store";
import { getProjectSettingsSectionFromPath, useCloseSettings } from "@utilities";

import { Button, IconSvg } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const ProjectSettingsMainView = () => {
	const { projectValidationState, loading } = useCacheStore();

	const connectionsValidation = projectValidationState.connections;
	const variablesValidation = projectValidationState.variables;
	const triggersValidation = projectValidationState.triggers;

	const { projectId } = useParams();
	const location = useLocation();
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);
	const { setProjectSettingsDrawerOperation, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();
	const { fetchTriggers, fetchVariables, fetchConnections, connections, triggers } = useCacheStore();
	const closeSettings = useCloseSettings();

	const connectionsRef = useRef<HTMLDivElement>(null);
	const variablesRef = useRef<HTMLDivElement>(null);
	const triggersRef = useRef<HTMLDivElement>(null);
	const [glowingSection, setGlowingSection] = useState<string | null>(null);
	const isFirstLoadRef = useRef(true);

	useEffect(() => {
		if (projectId) {
			fetchVariables(projectId);
			fetchConnections(projectId);
			fetchTriggers(projectId);
		}
	}, [projectId, fetchVariables, fetchConnections, fetchTriggers]);

	useEffect(() => {
		if (projectId && connections && triggers && connections.length < 3 && triggers.length < 3) {
			setProjectSettingsAccordionState(projectId, "connections", true);
			setProjectSettingsAccordionState(projectId, "triggers", true);
			setProjectSettingsAccordionState(projectId, "variables", true);
		}
	}, [projectId, connections, triggers, setProjectSettingsAccordionState]);

	useEffect(() => {
		if (!projectId) return;

		const section = getProjectSettingsSectionFromPath(location.pathname);

		if (section) {
			setProjectSettingsAccordionState(projectId, section, true);

			if (isFirstLoadRef.current) {
				setGlowingSection(section);
				isFirstLoadRef.current = false;

				const timer = setTimeout(() => {
					setGlowingSection(null);
				}, 6000);

				return () => clearTimeout(timer);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname, projectId]);

	const close = () => {
		if (!projectId) return;
		closeDrawer(projectId, DrawerName.projectSettings);
		setProjectSettingsDrawerOperation(projectId, null);
		closeSettings();
	};

	const onOperation = (
		type: "connection" | "variable" | "trigger",
		action: "add" | "edit" | "delete",
		id?: string
	) => {
		if (!projectId) return;
		setProjectSettingsDrawerOperation(projectId, { type, action, id });
	};

	useEffect(() => {
		const ref =
			glowingSection === "connections"
				? connectionsRef
				: glowingSection === "variables"
					? variablesRef
					: glowingSection === "triggers"
						? triggersRef
						: null;

		if (!ref?.current) return;

		const element = ref.current;
		const innerElement = element.querySelector("[data-glow-target]") as HTMLElement;
		const targetElement = innerElement || element;

		const originalBoxShadow = targetElement.style.boxShadow;
		const originalTransition = targetElement.style.transition;

		targetElement.style.boxShadow = "inset 0 0 0 1px rgba(188, 248, 112, 0)";
		targetElement.style.transition = "box-shadow 6s ease-out";

		setTimeout(() => {
			targetElement.style.boxShadow = "inset 0 0 0 1px rgba(188, 248, 112, 1)";
		}, 0);

		return () => {
			targetElement.style.boxShadow = originalBoxShadow;
			targetElement.style.transition = originalTransition;
		};
	}, [glowingSection]);

	return (
		<div className="relative mx-auto flex size-full flex-col">
			<div className="shrink-0 pb-2 pl-8 pr-6 pt-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-base font-semibold text-white">Configuration</h2>
					<Button
						ariaLabel="Close Project Settings"
						className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
						id="close-project-settings-button"
						onClick={close}
					>
						<IconSvg className="fill-white" src={Close} />
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-y-2 overflow-y-auto pl-8 pr-6">
				<div
					className="flex w-full items-start gap-3 rounded-lg transition-all duration-300"
					id="project-connections-settings"
					ref={connectionsRef}
				>
					<Connections
						isLoading={loading.connections}
						onOperation={onOperation}
						validation={connectionsValidation}
					/>
				</div>

				<div
					className="flex w-full items-start gap-3 rounded-lg transition-all duration-300"
					id="project-triggers-settings"
					ref={triggersRef}
				>
					<Triggers isLoading={loading.triggers} onOperation={onOperation} validation={triggersValidation} />
				</div>

				<div
					className="flex w-full items-start gap-3 rounded-lg transition-all duration-300"
					id="project-variables-settings"
					ref={variablesRef}
				>
					<Variables
						isLoading={loading.variables}
						onOperation={onOperation}
						validation={variablesValidation}
					/>
				</div>
			</div>
		</div>
	);
};
