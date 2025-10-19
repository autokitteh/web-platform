import React from "react";

import { useTranslation } from "react-i18next";

import { DocumentationModal } from "./documentationModal";
import { ProjectConfigConnections } from "./projectConfigConnections";
import { ProjectConfigDeleteView } from "./projectConfigDeleteView";
import { ProjectConfigDocumentation } from "./projectConfigDocumentation";
import { ProjectConfigFiles } from "./projectConfigFiles";
import { ProjectConfigTriggers } from "./projectConfigTriggers";
import { ProjectConfigVariables } from "./projectConfigVariables";
import { ProjectConfigViewProps } from "@interfaces/components";

import { ActiveIndicator } from "@components/molecules";
import { AddFileModal } from "@components/organisms/code/addModal";

export const ProjectConfigView = ({ hasActiveDeployment }: ProjectConfigViewProps) => {
	const { t } = useTranslation("project-configuration-view");

	return (
		<>
			<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
				<h2 className="text-2xl font-semibold text-white">Configuration</h2>
				{hasActiveDeployment ? (
					<div className="mb-3 mt-6">
						<ActiveIndicator indicatorText={t("activeDeployment")} />
					</div>
				) : null}

				<ProjectConfigDocumentation />
				<ProjectConfigFiles />

				<ProjectConfigConnections />
				<ProjectConfigVariables />
				<ProjectConfigTriggers />
			</div>
			<DocumentationModal />
			<ProjectConfigDeleteView />
			<AddFileModal />
		</>
	);
};
