import { CommunityProjectCategory } from "@type/components";

import { GithubIcon } from "@assets/image/icons";

export const defaultCommunityProjectCategory = "CI/CD";

export const communityProjectCategories: CommunityProjectCategory[] = [
	{
		name: "CI/CD",
		cards: [
			{
				integrations: [
					{ icon: GithubIcon, title: "Github" },
					{ icon: GithubIcon, title: "Github" },
				],
				title: "Name of Project",
				description:
					"Automation includes using various equipment and control systems such as factory processes",
				counter: 235,
			},
			{
				integrations: [{ icon: GithubIcon, title: "Github" }],
				title: "Name of Project",
				description: "Jenkins integrates with version control systems and provides CI/CD pipelines",
				counter: 150,
			},
		],
	},
	{
		name: "DevOps",
		cards: [
			{
				integrations: [
					{ icon: GithubIcon, title: "Github" },
					{ icon: GithubIcon, title: "Github" },
					{ icon: GithubIcon, title: "Github" },
					{ icon: GithubIcon, title: "Github" },
				],
				title: "Name of Project",
				description: "DevOps tools for containerization and orchestration",
				counter: 300,
			},
			{
				integrations: [{ icon: GithubIcon, title: "Github" }],
				title: "Name of Project",
				description: "Infrastructure as Code (IaC) tools for automated provisioning",
				counter: 120,
			},
		],
	},
	{
		name: "Dev Processes",
		cards: [
			{
				integrations: [{ icon: GithubIcon, title: "Github" }],
				title: "Name of Project",
				description: "Tools for managing development processes and documentation",
				counter: 200,
			},
		],
	},
	{
		name: "Office Automations",
		cards: [
			{
				integrations: [
					{ icon: GithubIcon, title: "Github" },
					{ icon: GithubIcon, title: "Github" },
				],
				title: "Name of Project",
				description: "Automation tools for office productivity and collaboration",
				counter: 180,
			},
		],
	},
	{
		name: "Ops",
		cards: [
			{
				integrations: [{ icon: GithubIcon, title: "Github" }],
				title: "Name of Project",
				description: "Operations tools for monitoring and incident management",
				counter: 220,
			},
		],
	},
];
