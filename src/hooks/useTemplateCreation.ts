import { useCallback, useMemo } from "react";

import { useCreateProjectFromTemplate } from "@src/hooks";
import { TemplateMetadata } from "@src/interfaces/store";
import { useProjectStore } from "@src/store";

export const useTemplateCreation = () => {
	const { createProjectFromAsset, isCreating } = useCreateProjectFromTemplate();
	const { projectsList } = useProjectStore();

	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);
	const projectNamesList = useMemo(() => Array.from(projectNamesSet), [projectNamesSet]);

	const checkTemplateStatus = useCallback(
		(template: TemplateMetadata) => {
			if (!template) return { canCreate: false };

			const alreadyExists = projectNamesSet.has(template.assetDirectory);
			return {
				canCreate: true,
				alreadyExists,
				template,
			};
		},
		[projectNamesSet]
	);

	const createTemplate = useCallback(
		(templateDirectory: string) => {
			return createProjectFromAsset(templateDirectory);
		},
		[createProjectFromAsset]
	);

	const createNamedTemplate = useCallback(
		(templateDirectory: string, projectName: string) => {
			return createProjectFromAsset(templateDirectory, projectName);
		},
		[createProjectFromAsset]
	);

	return {
		checkTemplateStatus,
		createTemplate,
		createNamedTemplate,
		isCreating,
		projectNamesList,
	};
};
