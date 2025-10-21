export type ExampleCategory = "integrations" | "alerts" | "dataSync" | "all";

export interface WorkflowExample {
	id: string;
	titleKey: string;
	textKey: string;
	category: ExampleCategory;
	tags: string[];
}

export const workflowExamples: WorkflowExample[] = [
	{
		id: "webhookSms",
		titleKey: "examples.webhookSms.title",
		textKey: "examples.webhookSms.text",
		category: "integrations",
		tags: ["Twilio", "Webhook", "SMS"],
	},
	{
		id: "uptimeMonitor",
		titleKey: "examples.uptimeMonitor.title",
		textKey: "examples.uptimeMonitor.text",
		category: "alerts",
		tags: ["Monitoring", "Google Sheets", "Slack"],
	},
	{
		id: "redditTracker",
		titleKey: "examples.redditTracker.title",
		textKey: "examples.redditTracker.text",
		category: "integrations",
		tags: ["Reddit", "ChatGPT", "Slack", "Google Sheets"],
	},
	{
		id: "hackerNewsMonitor",
		titleKey: "examples.hackerNewsMonitor.title",
		textKey: "examples.hackerNewsMonitor.text",
		category: "alerts",
		tags: ["HackerNews", "ChatGPT", "Slack", "Google Sheets"],
	},
	{
		id: "hubspotContacts",
		titleKey: "examples.hubspotContacts.title",
		textKey: "examples.hubspotContacts.text",
		category: "integrations",
		tags: ["HubSpot", "Webhook", "Slack"],
	},
	{
		id: "emailReply",
		titleKey: "examples.emailReply.title",
		textKey: "examples.emailReply.text",
		category: "integrations",
		tags: ["Gmail", "ChatGPT", "Slack"],
	},
	{
		id: "slackPrNotify",
		titleKey: "examples.slackPrNotify.title",
		textKey: "examples.slackPrNotify.text",
		category: "alerts",
		tags: ["GitHub", "Slack"],
	},
	{
		id: "slackChatBot",
		titleKey: "examples.slackChatBot.title",
		textKey: "examples.slackChatBot.text",
		category: "integrations",
		tags: ["Slack", "ChatGPT", "Gmail"],
	},
];
