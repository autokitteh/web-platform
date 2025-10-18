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
		<div className="flex h-full flex-col overflow-y-auto p-6">
			<div className="mx-auto max-w-xl space-y-8">
				{hasActiveDeployment ? (
					<div className="mb-6">
						<ActiveIndicator indicatorText={t("activeDeployment")} />
					</div>
				) : null}

				<ProjectConfigConnections />
				<ProjectConfigVariables />
				<ProjectConfigTriggers />
			</div>
		</div>
	);
};
