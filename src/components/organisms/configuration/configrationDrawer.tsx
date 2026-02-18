import React, { useCallback, useEffect, useMemo, useState } from "react";

import { LuLayoutDashboard } from "react-icons/lu";
import { Link, useLocation, useParams } from "react-router-dom";

import { defaultProjectSettingsWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent, useResize } from "@src/hooks";
import { useCacheStore, useSharedBetweenProjectsStore } from "@src/store";
import { cn } from "@src/utilities";
import { extractSettingsPath } from "@src/utilities/navigation";

import { ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";
import { ConfigurationBySubPath } from "@components/organisms/configuration/configurationBySubPath";

const VisualModeButton = ({ projectId }: { projectId: string }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Link
			className={cn(
				"group relative mb-4 flex h-10 items-center overflow-hidden transition-all duration-500 ease-out",
				isHovered ? "w-36" : "w-10"
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			to={`/projects/${projectId}/canvas`}
		>
			<svg
				className="absolute inset-0 size-full"
				fill="none"
				preserveAspectRatio="none"
				viewBox="0 0 144 40"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect
					className={cn("transition-all duration-300", isHovered ? "opacity-15" : "opacity-0")}
					fill="#22c55e"
					height="38"
					rx="7"
					width="142"
					x="1"
					y="1"
				/>
				<rect
					className={cn("transition-opacity duration-300", isHovered ? "opacity-100" : "opacity-40")}
					height="38"
					rx="7"
					stroke={isHovered ? "#22c55e" : "#4b5563"}
					strokeWidth="1.5"
					width="142"
					x="1"
					y="1"
				/>
				<rect
					className={cn("transition-all duration-500", isHovered ? "opacity-100" : "opacity-0")}
					height="38"
					rx="7"
					stroke="url(#visual-mode-gradient)"
					strokeDasharray="30 330"
					strokeLinecap="round"
					strokeWidth="2"
					style={{
						animation: isHovered ? "border-trace 2s linear infinite" : "none",
					}}
					width="142"
					x="1"
					y="1"
				/>
				<defs>
					<linearGradient id="visual-mode-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
						<stop offset="0%" stopColor="#22c55e">
							<animate
								attributeName="stop-color"
								dur="2s"
								repeatCount="indefinite"
								values="#22c55e;#4ade80;#86efac;#4ade80;#22c55e"
							/>
						</stop>
						<stop offset="100%" stopColor="#4ade80">
							<animate
								attributeName="stop-color"
								dur="2s"
								repeatCount="indefinite"
								values="#4ade80;#86efac;#22c55e;#86efac;#4ade80"
							/>
						</stop>
					</linearGradient>
				</defs>
			</svg>

			<div className="relative z-10 flex items-center gap-2 px-2.5">
				<LuLayoutDashboard
					className={cn(
						"size-5 shrink-0 transition-all duration-300",
						isHovered ? "text-green-400" : "text-gray-400"
					)}
				/>
				<span
					className={cn(
						"whitespace-nowrap text-sm font-medium transition-all duration-500",
						isHovered
							? "translate-x-0 text-green-400 opacity-100"
							: "-translate-x-2 text-gray-400 opacity-0"
					)}
				>
					Visual Mode
				</span>
			</div>

			<style>
				{`
					@keyframes border-trace {
						0% { stroke-dashoffset: 360; }
						100% { stroke-dashoffset: 0; }
					}
				`}
			</style>
		</Link>
	);
};

export const ProjectConfigurationDrawer = () => {
	const { projectId } = useParams();
	const location = useLocation();
	const setProjectSettingsWidth = useSharedBetweenProjectsStore((state) => state.setProjectSettingsWidth);
	const projectSettingsWidth = useSharedBetweenProjectsStore((state) => state.projectSettingsWidth);

	const fetchTriggers = useCacheStore((state) => state.fetchTriggers);
	const fetchVariables = useCacheStore((state) => state.fetchVariables);
	const fetchConnections = useCacheStore((state) => state.fetchConnections);

	const { settingsPath } = extractSettingsPath(location.pathname);
	const settingsSubPath = settingsPath?.replace(/^\/?settings\/?/, "") || "";

	const currentProjectSettingsWidth = useMemo(
		() => projectSettingsWidth[projectId!] || defaultProjectSettingsWidth.initial,
		[projectSettingsWidth, projectId]
	);

	const handleResizeChange = useCallback(
		(width: number) => {
			if (projectId) {
				setProjectSettingsWidth(projectId, width);
			}
		},
		[projectId, setProjectSettingsWidth]
	);

	const [drawerWidth] = useResize({
		direction: "horizontal",
		min: defaultProjectSettingsWidth.min,
		max: defaultProjectSettingsWidth.max,
		initial: currentProjectSettingsWidth,
		value: currentProjectSettingsWidth,
		id: "project-config-drawer-resize",
		onChange: handleResizeChange,
		invertDirection: true,
	});

	useEffect(() => {
		if (projectId) {
			fetchVariables(projectId);
			fetchConnections(projectId);
			fetchTriggers(projectId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const className = cn(
		"flex h-full flex-col overflow-y-auto overflow-x-hidden bg-gray-1100",
		"rounded-r-2xl px-8 py-3 sm:py-5 md:py-7"
	);

	return (
		<Drawer
			bgClickable
			bgTransparent
			className={className}
			data-testid="project-sidebar-config"
			divId="project-sidebar-config"
			isForcedOpen={true}
			isScreenHeight={false}
			name={DrawerName.settings}
			onCloseCallback={() => triggerEvent(EventListenerName.hideProjectConfigSidebar)}
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute rounded-r-2xl"
		>
			{!location.pathname.includes("/canvas") && projectId ? <VisualModeButton projectId={projectId} /> : null}
			<ConfigurationBySubPath settingsSubPath={settingsSubPath} />
			<ResizeButton
				className="absolute left-0 right-auto top-1/2 z-[125] w-2 -translate-y-1/2 cursor-ew-resize px-1 hover:bg-white"
				direction="horizontal"
				id="project-config-drawer-resize-button"
				resizeId="project-config-drawer-resize"
			/>
		</Drawer>
	);
};
