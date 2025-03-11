import { ProjectsIcon } from "@assets/image";
import { StartTemplateIcon } from "@assets/image/icons";

export const welcomeCards = [
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
		id: "template",
		icon: StartTemplateIcon,
		translationKey: {
			title: "useTemplate",
			description: "useTemplateDesc",
			buttonText: "browseTemplates",
		},
	},
];
