import { FiDownload } from "react-icons/fi";

import { NewProject, ProjectsIcon } from "@assets/image";
import { StartTemplateIcon } from "@assets/image/icons";

export const welcomeCards = [
	{
		id: "template",
		icon: StartTemplateIcon,
		translationKey: {
			title: "useTemplate",
			description: "useTemplateDesc",
			buttonText: "browseTemplates",
		},
	},
	{
		id: "demo",
		icon: ProjectsIcon,
		translationKey: {
			title: "newProject",
			description: "newProjectDesc",
			buttonText: "createNew",
		},
	},
	{
		id: "createFromScratch",
		icon: NewProject,
		translationKey: {
			title: "createFromScratch",
			description: "createFromScratchDesc",
			buttonText: "createFromScratchButton",
		},
	},
	{
		id: "importExisting",
		icon: FiDownload,
		translationKey: {
			title: "importExisting",
			description: "importExistingDesc",
			buttonText: "importExistingButton",
		},
	},
];
