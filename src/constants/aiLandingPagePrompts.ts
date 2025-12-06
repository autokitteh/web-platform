export interface SuggestionPill {
	title: string;
	text: string;
}

export const initialPillsCount = 5;

export const createAiLandingPagePrompts = (tAi: (key: string) => string): SuggestionPill[] => [
	{
		title: tAi("prompts.websiteHealthMonitoring.title"),
		text: tAi("prompts.websiteHealthMonitoring.text"),
	},
	{
		title: tAi("prompts.releaseNotesAgent.title"),
		text: tAi("prompts.releaseNotesAgent.text"),
	},
	{
		title: tAi("prompts.webhookToLinearTicket.title"),
		text: tAi("prompts.webhookToLinearTicket.text"),
	},
	{
		title: tAi("prompts.telegramTranslatorAgent.title"),
		text: tAi("prompts.telegramTranslatorAgent.text"),
	},
	{
		title: tAi("prompts.redditTrackerAgent.title"),
		text: tAi("prompts.redditTrackerAgent.text"),
	},
	{
		title: tAi("prompts.hackerNewsTrackerAgent.title"),
		text: tAi("prompts.hackerNewsTrackerAgent.text"),
	},
	{
		title: tAi("prompts.githubToSlack.title"),
		text: tAi("prompts.githubToSlack.text"),
	},
	{
		title: tAi("prompts.youtubeChannelMonitor.title"),
		text: tAi("prompts.youtubeChannelMonitor.text"),
	},
	{
		title: tAi("prompts.aiInboxAssistant.title"),
		text: tAi("prompts.aiInboxAssistant.text"),
	},
	{
		title: tAi("prompts.dailyWeatherAlert.title"),
		text: tAi("prompts.dailyWeatherAlert.text"),
	},
	{
		title: tAi("prompts.whatsappFoodTrackingBot.title"),
		text: tAi("prompts.whatsappFoodTrackingBot.text"),
	},
];
