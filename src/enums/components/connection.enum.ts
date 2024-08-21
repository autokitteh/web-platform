export enum ConnectionStatus {
	error = 3,
	ok = 1,
	unspecified = 0,
	warning = 2,
}

export enum GoogleIntegrations {
	sheets = "sheets",
	calendar = "calendar",
	drive = "drive",
	forms = "forms",
}

enum RegularIntegrations {
	github = "github",
	slack = "slack",
	google = "google",
	googlegemini = "googlegemini",
	aws = "aws",
	gmail = "gmail",
	http = "http",
	twilio = "twilio",
	jira = "jira",
	discord = "discord",
	chatgpt = "chatgpt",
}

export const Integrations = {
	...RegularIntegrations,
	...GoogleIntegrations,
};
