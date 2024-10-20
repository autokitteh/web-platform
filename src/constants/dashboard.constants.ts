import { HiddenIntegrationsForTemplates, IntegrationsMap } from "@src/enums/components/connection.enum";
import { TemplateCategory } from "@src/types/components";

export const defaultTemplateProjectCategory = "DevOps";

const hiddenTemplateProjectsCategories = [
	{
		cards: [
			{
				assetDirectory: "quickstart",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
		],
	},
];

export const meowWorldProjectName = "quickstart";

export const templateProjectsCategories: TemplateCategory[] = [
	{
		name: "DevOps",
		cards: [
			{
				title: "AWS Health to Slack",
				description: "Monitor AWS health events",
				integrations: [IntegrationsMap.aws, IntegrationsMap.slack, IntegrationsMap.sheets],
				assetDirectory: "aws_health_to_slack",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Slack notify on Confluence page created",
				description: "When Confluence page is created the user will be notified on Slack",
				integrations: [IntegrationsMap.confluence, IntegrationsMap.slack],
				assetDirectory: "confluence_to_slack",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Create Jira ticket from Google form",
				description:
					"Trigger by HTTP request, continue polling Google forms, and create Jira ticket based on the form's data",
				integrations: [IntegrationsMap.forms, HiddenIntegrationsForTemplates.http, IntegrationsMap.jira],
				assetDirectory: "google_forms_to_jira",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "JIRA Assignee From Google Calendar Workflow",
				description: "Set Assignee in Jira ticket to the person currently on-call",
				integrations: [IntegrationsMap.jira, IntegrationsMap.calendar],
				assetDirectory: "jira_google_calendar/assignee_from_schedule",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Create calendar due date event for Jira ticket",
				description:
					"When a new Jira issue is created, the workflow automatically generates a Google Calendar event with a deadline",
				integrations: [IntegrationsMap.calendar, IntegrationsMap.jira],
				assetDirectory: "jira_google_calendar/deadline_to_event",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Pull Request Review Reminder (Purrr)",
				description:
					"Purrr integrates GitHub and Slack efficiently, to streamline code reviews and cut down the turnaround time to merge pull requests.",
				integrations: [IntegrationsMap.github, IntegrationsMap.slack],
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
				integrations: [IntegrationsMap.slack, IntegrationsMap.github, IntegrationsMap.sheets],
				assetDirectory: "reviewkitteh",
				files: ["README.md", "autokitteh.yaml", "program.star"],
			},
			{
				title: "Manage emergency AWS access requests via Slack",
				description:
					"Submit emergency AWS access requests via Slack, which are then approved or denied based on a set of predefined conditions",
				integrations: [IntegrationsMap.aws, IntegrationsMap.slack],
				assetDirectory: "break_glass",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Parse a file in S3 and insert to database",
				description:
					"Triggered by a new GPX file on an S3 bucket, the pipeline code will parse the GPX file and insert it into a database.",
				integrations: [
					IntegrationsMap.aws,
					HiddenIntegrationsForTemplates.http,
					HiddenIntegrationsForTemplates.sqlite3,
				],
				assetDirectory: "data_pipeline",
				files: [
					"Makefile",
					"README.md",
					"autokitteh.yaml",
					"bucket_event.json",
					"example-sns-event.json",
					"hike.gpx",
					"pipeline.py",
					"schema.sql",
					"subscription-event.json",
				],
			},
			{
				title: "Log Discord messages to Sheets",
				description: "Logging Discord messages to a Google Sheets document",
				integrations: [IntegrationsMap.discord, IntegrationsMap.sheets],
				assetDirectory: "discord_to_spreadsheet",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Unregister non active users from Copilot",
				description:
					"If Copilot was not used in a preceding period by users, the workflow automatically unregisters and notifies them. Users can ask for their subscription to be reinstated.",
				integrations: [HiddenIntegrationsForTemplates.githubcopilot, IntegrationsMap.slack],
				assetDirectory: "github_copilot_seats",
				files: ["README.md", "autokitteh.yaml", "helpers.star", "msg.star", "seats.star", "triggers.star"],
			},
			{
				title: "Create Jira Ticket from a Webhook data",
				description: "Create Jira Ticket from a Webhook data",
				integrations: [IntegrationsMap.jira, HiddenIntegrationsForTemplates.http],
				assetDirectory: "webhook_to_jira",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
		],
	},
	{
		name: "Samples",
		cards: [
			{
				title: "Jira",
				description: "Samples using Jira APIs",
				integrations: [IntegrationsMap.jira],
				assetDirectory: "samples/atlassian/jira",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Discord Client",
				description: "Samples using Discord APIs",
				integrations: [IntegrationsMap.discord],
				assetDirectory: "samples/discord/discord_client",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Discord Events",
				description: "Samples using Discord events",
				integrations: [IntegrationsMap.discord],
				assetDirectory: "samples/discord/events",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "GitHub",
				description: "Samples using GitHub APIs",
				integrations: [IntegrationsMap.github],
				assetDirectory: "samples/github",
				files: ["README.md", "autokitteh.yaml", "workflow.py", "program.py"],
			},
			{
				title: "Google Calendar",
				description: "Samples using Google Calendar APIs",
				integrations: [IntegrationsMap.calendar],
				assetDirectory: "samples/google/calendar",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Google Forms",
				description: "Samples using Google Forms APIs",
				integrations: [IntegrationsMap.forms],
				assetDirectory: "samples/google/forms",
				files: ["README.md", "autokitteh.yaml", "program.py", "new_question.json"],
			},
			{
				title: "Gmail",
				description: "Samples using Gmail APIs",
				integrations: [IntegrationsMap.gmail],
				assetDirectory: "samples/google/gmail",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Google Sheets",
				description: "Samples using Google Sheets APIs",
				integrations: [IntegrationsMap.sheets],
				assetDirectory: "samples/google/sheets",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "HTTP",
				description: "Samples using HTTP requests and webhooks",
				integrations: [HiddenIntegrationsForTemplates.http],
				assetDirectory: "samples/http",
				files: [
					"README.md",
					"autokitteh.yaml",
					"basic_auth.py",
					"bearer_token.py",
					"no_auth.py",
					"webhooks.py",
				],
			},
			{
				title: "OpenAI ChatGPT",
				description: "Samples using chatGPT APIs",
				integrations: [IntegrationsMap.chatgpt],
				assetDirectory: "samples/openai_chatgpt",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Runtime Events",
				description: "Samples using events in AutoKitteh - subscribe(), next_event(), unsubscribe()",
				integrations: [HiddenIntegrationsForTemplates.autokitteh],
				assetDirectory: "samples/runtime_events",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Scheduler",
				description: "Samples using cron scheduler for workflows",
				integrations: [HiddenIntegrationsForTemplates.scheduler],
				assetDirectory: "samples/scheduler",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Slack",
				description: "Samples using Slack APIs",
				integrations: [IntegrationsMap.slack],
				assetDirectory: "samples/slack",
				files: ["README.md", "autokitteh.yaml", "program.py", "approval_message.json.txt"],
			},
			{
				title: "Twilio",
				description: "Samples using Twilio APIs",
				integrations: [IntegrationsMap.twilio],
				assetDirectory: "samples/twilio",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Quickstart",
				description: "Sample for quickstart",
				integrations: [HiddenIntegrationsForTemplates.http],
				assetDirectory: "quickstart",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
		],
	},
	{
		name: "Durable workflows",
		cards: [
			{
				title: "Fault tolerant workflow with manual Slack approvals",
				description:
					"Runs a sequence of tasks with fault tolerance. In case of failure, user can decide to terminate or retry from the point of failure.",
				integrations: [IntegrationsMap.slack],
				assetDirectory: "task_chain/single_workflow/basic",
				files: ["interactive_message.json.txt", "autokitteh.yaml", "program.py"],
			},
		],
	},
	{
		name: "Office Automation",
		cards: [
			{
				title: "Slack-Discord Message Mirroring",
				description: "mirroring messages between Slack and Discord channels",
				integrations: [IntegrationsMap.slack, IntegrationsMap.discord],
				assetDirectory: "slack_discord_sync",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Slack notify on important Email",
				description:
					"Categorizing incoming emails and notifying relevant Slack channels by integrating Gmail, ChatGPT, and Slack",
				integrations: [IntegrationsMap.gmail, IntegrationsMap.slack, IntegrationsMap.chatgpt],
				assetDirectory: "categorize_emails",
				files: ["README.md", "autokitteh.yaml", "program.py"],
			},
			{
				title: "Ad-hoc room reservation via Slack",
				description: "Ad-hoc room reservation via Slack slash commands",
				integrations: [IntegrationsMap.slack, IntegrationsMap.calendar],
				assetDirectory: "room_reservation",
				files: [
					"README.md",
					"autokitteh.yaml",
					"available_rooms.py",
					"google_sheets.py",
					"reserve_room.py",
					"room_status.py",
				],
			},
			{
				title: "Slack bot for assistance requests with AI categorization",
				description:
					"Slack bot: request for assistance is inferred using Google's Gemini AI. The appropriate person is mentioned according to a predetermined table of expertise in a Google Doc. The person can then !take the request and later !resolve it.",
				integrations: [IntegrationsMap.slack, IntegrationsMap.googlegemini],
				assetDirectory: "slack_support",
				files: ["README.md", "autokitteh.yaml", "directory.py", "gemini.py", "main.py"],
			},
		],
	},
];

export const findTemplateFilesByAssetDirectory = async (assetDirectory: string) => {
	const projectsCategories = [...templateProjectsCategories, ...hiddenTemplateProjectsCategories];
	for (const category of projectsCategories) {
		const card = category.cards.find((card) => card.assetDirectory === assetDirectory);
		if (card) {
			return card.files;
		}
	}

	return undefined;
};
