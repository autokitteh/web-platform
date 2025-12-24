import React, { useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";

import { ProjectCard } from "./projectCard";
import { ProjectsTableModals } from "../projectsTable/components";
import { useProjectsStats, useProjectsTableActions } from "../projectsTable/hooks";
import { projectsBoardCardGap, projectsBoardCardHeight } from "@constants";

import { TableSkeleton } from "@components/atoms";

export const ProjectsBoard = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const containerRef = useRef<HTMLDivElement>(null);

	const { projectsStats, isLoadingStats, failedProjects, updateProjectStatus, projectsWithStats } =
		useProjectsStats();

	const { handleProjectDelete, handleRowClick, tableMeta, isDeleting } = useProjectsTableActions({
		projectsStats,
		isLoadingStats,
		failedProjects,
		updateProjectStatus,
	});

	const rowVirtualizer = useVirtualizer({
		count: projectsWithStats.length,
		getScrollElement: () => containerRef.current,
		estimateSize: () => projectsBoardCardHeight + projectsBoardCardGap,
		overscan: 3,
	});

	if (isLoadingStats && projectsWithStats.length === 0) {
		return (
			<div className="flex h-full flex-col overflow-hidden">
				<div className="mb-2 flex items-center gap-x-2">
					<h2 className="font-fira-sans text-xs font-medium uppercase tracking-widest text-gray-500">
						Projects
					</h2>
					<div className="h-px flex-1 bg-gradient-to-r from-gray-1050 to-transparent" />
				</div>
				<TableSkeleton rows={5} />
			</div>
		);
	}

	if (projectsWithStats.length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="font-fira-sans text-sm text-gray-500">{t("table.noProjectsFound")}</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<div className="mb-2 flex items-center gap-x-2">
				<h2 className="font-fira-sans text-xs font-medium uppercase tracking-widest text-gray-500">Projects</h2>
				<div className="h-px flex-1 bg-gradient-to-r from-gray-1050 to-transparent" />
			</div>

			<div className="min-h-64 flex-1 overflow-auto" ref={containerRef}>
				<div
					className="relative w-full"
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const project = projectsWithStats[virtualRow.index];
						const isLoading = tableMeta.isLoadingStats(project.id);
						const hasError = tableMeta.hasLoadError(project.id);

						return (
							<div
								className="absolute left-0 top-0 w-full px-0.5"
								key={project.id}
								style={{
									height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<ProjectCard
									hasError={hasError}
									isLoading={isLoading}
									onDeactivate={tableMeta.onDeactivate}
									onDelete={tableMeta.onDelete}
									onExport={tableMeta.onExport}
									onRowClick={handleRowClick}
									onSessionClick={tableMeta.onSessionClick}
									project={project}
								/>
							</div>
						);
					})}
				</div>
			</div>

			<ProjectsTableModals isDeleting={isDeleting} onDelete={handleProjectDelete} />
		</div>
	);
};
