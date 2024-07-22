import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { redirect, useParams } from "react-router-dom";

import { useProjectStore } from "@store/useProjectStore";
import { useToastStore } from "@store/useToastStore";
import { Project } from "@type/models";

import { Button, IconSvg } from "@components/atoms";

import { ProjectsIcon } from "@assets/image";

export const StatsTopbar = () => {
	const { t } = useTranslation(["projects", "errors"]);
	const { projectId } = useParams();
	const [project, setProject] = useState<Project>();
	const addToast = useToastStore((state) => state.addToast);

	const { getProject } = useProjectStore();

	const loadProject = async (projectId: string) => {
		const { data: project, error } = await getProject(projectId);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});

			return redirect("/404");
		}
		if (!project) {
			addToast({
				id: Date.now().toString(),
				message: t("projectNotFound"),
				type: "error",
			});

			return redirect("/404");
		}
		setProject(project);
	};

	useEffect(() => {
		loadProject(projectId!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return (
		<div className="flex items-center justify-between gap-5 rounded-b-xl bg-gray-1250 py-3 pl-7 pr-3.5">
			<div className="relative flex items-end gap-3 font-fira-code text-gray-500">
				<span className="text-xl font-bold leading-6">{project?.name}</span>

				<span className="text-sm font-semibold leading-tight">{project?.id}</span>
			</div>

			<div className="flex items-stretch gap-3">
				<Button
					ariaLabel={t("topbar.buttons.goToProject")}
					className="px-4 py-2 font-semibold text-white hover:bg-gray-1100"
					href={`/projects/${projectId}`}
					variant="outline"
				>
					<IconSvg className="fill-white" size="xl" src={ProjectsIcon} />

					{t("topbar.buttons.goToProject")}
				</Button>
			</div>
		</div>
	);
};
