import React, { useEffect } from "react";

import { useParams } from "react-router-dom";

import { TopbaButtonVariant } from "@enums/components";
import { useCacheStore } from "@src/store";
import { TopbarType } from "@src/types/components";

import { useFileOperations } from "@hooks";

import {
	ManualRunButtons,
	ManualRunSettingsDrawer,
	ProjectTopbarButtons,
	ProjectTopbarName,
	ProjectTopbarNavigation,
} from "@components/organisms/topbar/project";

export const ProjectConfigTopbar = ({ variant }: { variant: TopbarType }) => {
	const { projectId } = useParams();
	const { openProjectId, setOpenProjectId } = useFileOperations(projectId!);
	const { fetchDeployments, initCache } = useCacheStore();

	useEffect(() => {
		if (!projectId || variant !== TopbaButtonVariant.actions) return;

		if (projectId !== openProjectId) {
			setOpenProjectId(projectId);
			initCache(projectId!, true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const handleMunaualRun = () => {
		setTimeout(() => {
			fetchDeployments(projectId!, true);
		}, 100);
	};

	return (
		<div className="flex justify-between rounded-b-xl bg-gray-1250 pl-7 pr-3">
			<ProjectTopbarName />
			<ProjectTopbarNavigation />
			<div className="scrollbar flex">
				<div className="w-300 shrink-0" />
				{variant === TopbaButtonVariant.actions ? <ProjectTopbarButtons /> : null}
			</div>

			{variant === TopbaButtonVariant.manual ? (
				<>
					<ManualRunButtons />
					<ManualRunSettingsDrawer onRun={handleMunaualRun} />
				</>
			) : null}
		</div>
	);
};
