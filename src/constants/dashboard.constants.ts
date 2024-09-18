import { TableProjectCardType, TemplateCategory } from "@src/types/components";

import {
	AwsIcon,
	ConfluenceIcon,
	GithubIcon,
	GoogleCalendarIcon,
	GoogleGmailIcon,
	GoogleSheetsIcon,
	JiraIcon,
	OpenAiIcon,
	SlackIcon,
} from "@assets/image/icons/connections";

export const defaultTemplateProjectCategory = "DevOps";

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
					{ icon: GoogleSheetsIcon, title: "Sheets" },
				],
				assetDirectory: "aws_health_to_slack",
				files: ["autokitteh.yaml", "program.py"],
			},
			{
				title: "Slack notify on Confluence page created",
				description: "When Confluence page is created the user will be notified on Slack",
				integrations: [
					{ icon: ConfluenceIcon, title: "Confluence" },
					{ icon: SlackIcon, title: "Slack" },
				],
				assetDirectory: "confluence_to_slack",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "JIRA Assignee From Google Calendar Workflow",
				description: "Set Assignee in Jira ticket to the person currently on-call",
				integrations: [
					{ icon: JiraIcon, title: "Jira" },
					{ icon: GoogleCalendarIcon, title: "Google Calendar" },
				],
				assetDirectory: "jira_assignee_from_calendar",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Create calendar due date event for Jira ticket",
				description: "Jira issue in a designated project creates a Google Calendar event for due date",
				integrations: [
					{ icon: GoogleCalendarIcon, title: "Google Calendar" },
					{ icon: JiraIcon, title: "Jira" },
				],
				assetDirectory: "jira_to_google_calendar",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Pull Request Review Reminder (Purrr)",
				description:
					"Purrr integrates GitHub and Slack efficiently, to streamline code reviews and cut down the turnaround time to merge pull requests.",
				integrations: [
					{ icon: GithubIcon, title: "GitHub" },
					{ icon: SlackIcon, title: "Slack" },
				],
				assetDirectory: "purrr",
				files: [
					"README.md",
					"autokitteh.yaml",
					"debug.star",
					"github_helpers.star",
					"github_issue_comment.star",
					"github_pr.star",
					"github_pr_review.star",
					"github_review_comment.star",
					"github_thread.star",
					"markdown.star",
					"redis_helpers.star",
					"slack_cmd.star",
					"slack_helpers.star",
					"slack_message.star",
					"slack_reaction.star",
					"user_helpers.star",
				],
			},
			{
				title: "Monitor PR until completion in Slack",
				description: "Create a Slack channel for each PR, update team leads until completion",
				integrations: [
					{ icon: SlackIcon, title: "Slack" },
					{ icon: GithubIcon, title: "GitHub" },
					{ icon: GoogleSheetsIcon, title: "Sheets" },
				],
				assetDirectory: "reviewkitteh",
				files: ["autokitteh.yaml", "program.star"],
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
					{ icon: GoogleGmailIcon, title: "Gmail" },
					{ icon: SlackIcon, title: "Slack" },
					{ icon: OpenAiIcon, title: "ChatGPT" },
				],
				assetDirectory: "categorize_notify",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
		],
	},
];

export const dashboardProjectsCards: TableProjectCardType[] = [
	{
		title: "Build another Slack project",
		description: "What are the benefits of workflow automation? From reduced costs to greater productivity",
		assetDirectory: "aws_health_to_slack",
		icon: SlackIcon,
	},
	{
		title: "Try connecting your Github",
		description: "What are the benefits of workflow automation? From reduced costs to greater productivity",
		assetDirectory: "purrr",
		icon: GithubIcon,
	},
];

export const findTemplateFilesByAssetDirectory = async (assetDirectory: string) => {
	for (const category of templateProjectsCategories) {
		const card = category.cards.find((card) => card.assetDirectory === assetDirectory);
		if (card) {
			return card.files;
		}
	}

	return undefined;
};
