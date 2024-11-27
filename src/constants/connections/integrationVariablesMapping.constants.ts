import { Integrations } from "@src/enums/components";

export const integrationVariablesMapping = {
	[Integrations.github]: {
		pat: "pat",
		secret: "pat_secret",
	},
	[Integrations.slack]: {
		bot_token: "botToken",
		app_token: "appToken",
	},
	[Integrations.twilio]: {
		account_sid: "acc_sid",
		api_key: "apiKey",
		api_secret: "api_secret",
	},
	[Integrations.gmail]: {
		json: "JSON",
	},
	[Integrations.sheets]: {
		json: "JSON",
	},
	[Integrations.drive]: {
		json: "JSON",
	},
	[Integrations.calendar]: {
		cal_id: "CalendarID",
		json: "JSON",
	},
	[Integrations.googlegemini]: {
		key: "api_key",
	},
	[Integrations.forms]: {
		form_id: "FormID",
		json: "JSON",
	},
	[Integrations.jira]: {
		base_url: "base_url",
		token: "token",
		email: "email",
	},
	[Integrations.confluence]: {
		base_url: "base_url",
		token: "token",
		email: "email",
	},
	[Integrations.asana]: {
		pat: "pat",
	},
	[Integrations.aws]: {
		region: "Region",
		access_key: "AccessKeyID",
		secret_key: "SecretKey",
		token: "Token",
	},
	[Integrations.discord]: {
		botToken: "BotToken",
	},
	[Integrations.chatgpt]: {
		key: "apiKey",
	},
};
