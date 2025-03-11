import { DiscordNoColorIcon, GithubIntroIcon, LinkedInIntroIcon, RedditIntroIcon } from "@assets/image/icons";

export const defaultTemplateProjectCategory = "DevOps";
export const defaultSelectedMultipleSelect = "All";
export const meowWorldProjectName = "quickstart";
export const templateCategoriesOrder = ["DevOps", "Samples", "Durable workflows", "Office Automation"];

export const whatIsAutoKitteh = [
	"Serverless automation platform",
	"Support of long-running, durable workflows",
	"Tools for building automations is code, simple deployment and monitoring",
	"Run Python code",
	"Workflow management",
];

export const howToBuildAutomation = [
	"Create Project",
	"Configure: Triggers, Connections to applications, Variables",
	"Code",
	"Deploy",
	"Monitor",
];

export const newsAutoKitteh = [
	"AutoKitteh is open for public Beta",
	"New feature: Manual - run a workflow by triggering entry point with predefined input.",
];

export const getStartedWithAutoKitteh = [
	{
		title: "Quick guide - Building projects",
		description: "Build your first project",
		youtubeLink: "https://www.youtube.com/embed/60DQ9Py4LqU?si=tat7TeACzguZKDSv",
		image: "startingProject.jpg",
	},
	{
		title: "Using VS-code extension",
		description: "Setup guide",
		youtubeLink: "https://www.youtube.com/embed/zNtJ8OBPUmY?si=lki2_wdImAhR2IhX",
		image: "usingVSCode.jpg",
	},
	{
		title: "Durable Python - example",
		description: "Recovery from failure demo",
		youtubeLink: "https://www.youtube.com/embed/xOcmMnput2Y?si=vyqnUVtuTgdOqBFx",
		image: "durablePython.jpg",
	},
	{
		title: "Introduction to AutoKitteh",
		description: "Why to use AutoKitteh",
		youtubeLink: "https://www.youtube.com/embed/QWSa0etwTDE?si=gStDV2t4cAVTPtFe",
		image: "introductionToAutoKitteh.jpg",
	},
	{
		title: "Building Event Driven Workflows",
		description: "Developer Guide",
		youtubeLink: "https://www.youtube.com/embed/wS8bcFCUhMs?si=6mecEpoWNOisiJ8a",
		image: "eventDrivenWorkflows.png",
	},
];

export const socialLinks = [
	{
		icon: RedditIntroIcon,
		link: "https://www.reddit.com/r/autokitteh",
		name: "Reddit",
	},
	{
		icon: LinkedInIntroIcon,
		link: "https://www.linkedin.com/company/autokitteh",
		name: "LinkedIn",
	},
	{
		icon: DiscordNoColorIcon,
		link: "https://discord.gg/UhnJuBarZQ",
		name: "Discord",
	},
	{
		icon: GithubIntroIcon,
		link: "https://github.com/autokitteh/autokitteh",
		name: "GitHub",
	},
];
