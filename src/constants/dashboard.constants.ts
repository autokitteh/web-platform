import { CommunityProjectCategory } from "@type/components";

import { GithubIcon } from "@assets/image/icons";

export const defaultCommunityProjectCategory = "CI/CD";

export const communityProjectCategories: CommunityProjectCategory[] = [
	{
		category: "CI/CD",
		cards: [
			{
				integrations: [GithubIcon, GithubIcon],
				description:
					"Automation includes using various equipment and control systems such as factory processes",
				akCounter: 235,
			},
			{
				integrations: [GithubIcon],
				description: "Jenkins integrates with version control systems and provides CI/CD pipelines",
				akCounter: 150,
			},
		],
	},
	{
		category: "DevOps",
		cards: [
			{
				integrations: [GithubIcon, GithubIcon],
				description: "DevOps tools for containerization and orchestration",
				akCounter: 300,
			},
			{
				integrations: [GithubIcon, GithubIcon],
				description: "Infrastructure as Code (IaC) tools for automated provisioning",
				akCounter: 120,
			},
		],
	},
	{
		category: "Dev Processes",
		cards: [
			{
				integrations: [GithubIcon, GithubIcon],
				description: "Tools for managing development processes and documentation",
				akCounter: 200,
			},
		],
	},
	{
		category: "Office Automations",
		cards: [
			{
				integrations: [GithubIcon, GithubIcon],
				description: "Automation tools for office productivity and collaboration",
				akCounter: 180,
			},
		],
	},
	{
		category: "Ops",
		cards: [
			{
				integrations: [GithubIcon, GithubIcon],
				description: "Operations tools for monitoring and incident management",
				akCounter: 220,
			},
		],
	},
];
