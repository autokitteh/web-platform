import { TemplateCategory } from "@src/types/components/projectTemplates.type";

import {
	AwsIcon,
	ConfluenceIcon,
	GithubIcon,
	GoogleCalendarIcon,
	GoogleFormsIcon,
	GoogleGmailIcon,
	GoogleSheetsIcon,
	HttpIcon,
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
			},
			{
				title: "Slack notify on Confluence page created",
				description: "When Confluence page is created the user will be notified on Slack",
				integrations: [
					{ icon: ConfluenceIcon, title: "Confluence" },
					{ icon: SlackIcon, title: "Slack" },
				],
				assetDirectory: "confluence_to_slack",
			},
			{
				title: "Create Jira Ticket on HTTP request",
				description: "Create a Jira ticket based on HTTP request",
				integrations: [
					{ icon: HttpIcon, title: "HTTP" },
					{ icon: JiraIcon, title: "Jira" },
				],
				assetDirectory: "create_jira_issue",
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
				assetDirectory: "google_forms_to_jira",
			},
			{
				title: "JIRA Assignee From Google Calendar Workflow",
				description: "Set Assignee in Jira ticket to the person currently on-call",
				integrations: [
					{ icon: JiraIcon, title: "Jira" },
					{ icon: GoogleCalendarIcon, title: "Google Calendar" },
				],
				assetDirectory: "jira_assignee_from_calendar",
			},
			{
				title: "Create calendar due date event for Jira ticket",
				description: "Jira issue in a designated project creates a Google Calendar event for due date",
				integrations: [
					{ icon: GoogleCalendarIcon, title: "Google Calendar" },
					{ icon: JiraIcon, title: "Jira" },
				],
				assetDirectory: "jira_to_google_calendar",
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
			},
		],
	},
];
