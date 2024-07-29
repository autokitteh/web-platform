import { CommunityProjectCategory } from "@type/components";
import { TemplateCategory } from "@type/components/communityProjectCategory.type";

import {
	AwsIcon,
	ChatGptIcon,
	ConfluenceIcon,
	GithubIcon,
	GmailIcon,
	GoogleCalendarIcon,
	GoogleFormsIcon,
	HttpIcon,
	JiraIcon,
	SheetsIcon,
	SlackIcon,
} from "@assets/image/icons";
import {
	AwsHealthToSlack,
	CategorizeNotify,
	ConfluenceToSlack,
	CreateJiraIssue,
	GoogleFormsToJira,
	JiraAssigneeFromCalendar,
	JiraToGoogleCalendar,
	Purrr,
	ReviewKitteh,
} from "@assets/templates";

export const defaultCommunityProjectCategory = "CI/CD";
export const defaultTemplateProjectCategory = "DevOps";

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

export const templateProjectsCategories: TemplateCategory[] = [
	{
		name: "DevOps",
		cards: [
			{
				title: "AWS Health to Slack",
				description: "Monitor AWS health events",
				integrations: [
					{ icon: AwsIcon, title: "AWS" },
					{ icon: SlackIcon, title: "Slack" },
					{ icon: SheetsIcon, title: "Sheets" },
				],
				asset: AwsHealthToSlack,
			},
			{
				title: "Slack notify on Confluence page created",
				description: "When Confluence page is created the user will be notified on Slack",
				integrations: [
					{ icon: ConfluenceIcon, title: "Confluence" },
					{ icon: SlackIcon, title: "Slack" },
				],
				asset: ConfluenceToSlack,
			},
			{
				title: "Create Jira Ticket on HTTP request",
				description: "Create a Jira ticket based on HTTP request",
				integrations: [
					{ icon: HttpIcon, title: "HTTP" },
					{ icon: JiraIcon, title: "Jira" },
				],
				asset: CreateJiraIssue,
			},
			{
				title: "Create Jira ticket from form",
				description:
					"Trigger by HTTP request, continue polling Google forms, and create Jira ticket based on the form's data",
				integrations: [
					{ icon: GoogleFormsIcon, title: "Forms" },
					{ icon: HttpIcon, title: "HTTP" },
					{ icon: JiraIcon, title: "Jira" },
				],
				asset: GoogleFormsToJira,
			},
			{
				title: "JIRA Assignee From Google Calendar Workflow",
				description: "Set Assignee in Jira ticket to the person currently on-call",
				integrations: [
					{ icon: JiraIcon, title: "Jira" },
					{ icon: GoogleCalendarIcon, title: "Google Calendar" },
				],
				asset: JiraAssigneeFromCalendar,
			},
			{
				title: "Create calendar due date event for Jira ticket",
				description: "Jira issue in a designated project creates a Google Calendar event for due date",
				integrations: [
					{ icon: GoogleCalendarIcon, title: "Google Calendar" },
					{ icon: JiraIcon, title: "Jira" },
				],
				asset: JiraToGoogleCalendar,
			},
			{
				title: "Pull Request Review Reminder (Purrr)",
				description:
					"Purrr integrates GitHub and Slack efficiently, to streamline code reviews and cut down the turnaround time to merge pull requests.",
				integrations: [
					{ icon: GithubIcon, title: "GitHub" },
					{ icon: SlackIcon, title: "Slack" },
				],
				asset: Purrr,
			},
			{
				title: "Monitor PR until completion in Slack",
				description: "Create a Slack channel for each PR, update team leads until completion",
				integrations: [
					{ icon: SlackIcon, title: "Slack" },
					{ icon: GithubIcon, title: "GitHub" },
					{ icon: SheetsIcon, title: "Sheets" },
				],
				asset: ReviewKitteh,
			},
		],
	},
	{
		name: "Office Automation",
		cards: [
			{
				title: "Slack notify on important Email",
				description:
					"Categorizing incoming emails and notifying relevant Slack channels by integrating Gmail, ChatGPT, and Slack",
				integrations: [
					{ icon: GmailIcon, title: "Gmail" },
					{ icon: SlackIcon, title: "Slack" },
					{ icon: ChatGptIcon, title: "ChatGPT" },
				],
				asset: CategorizeNotify,
			},
		],
	},
];
