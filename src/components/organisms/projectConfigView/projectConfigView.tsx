import React from "react";

import { useTranslation } from "react-i18next";

import { ProjectConfigConnections } from "./projectConfigConnections";
import { ProjectConfigTriggers } from "./projectConfigTriggers";
import { ProjectConfigVariables } from "./projectConfigVariables";
import { ProjectConfigViewProps } from "@interfaces/components";

import { ActiveIndicator } from "@components/molecules";

export const ProjectConfigView = ({ hasActiveDeployment }: ProjectConfigViewProps) => {
	const { t } = useTranslation("project-configuration-view");
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			{hasActiveDeployment ? (
				<div className="mb-6">
					<ActiveIndicator indicatorText={t("activeDeployment")} />
				</div>
			) : null}

			<ProjectConfigConnections />
			<ProjectConfigVariables />
			<ProjectConfigTriggers />
		</div>
	);
};
