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
		defaultText: {
			title: "Launch Your First Automation",
			description: "A hands-on demo - deploy a simple Python script, execute, and see the output",
			buttonText: "Start with a Demo",
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
		defaultText: {
			title: "Start From Template",
			description:
				"Choose from our collection of ready-made templates for common workflows and integrations. The fastest way to get started",
			buttonText: "Browse Templates",
		},
	},
];
