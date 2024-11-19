import { Integrations } from "@src/enums/components";

export const integrationVariablesMapping = {
	[Integrations.github]: {
		pat: "pat",
		secret: "Secret",
	},
	[Integrations.slack]: {
		bot_token: "botToken",
		app_token: "appToken",
	},
	[Integrations.twilio]: {
		account_sid: "AccountSID",
		api_key: "apiKey",
		api_secret: "apiSecret",
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
		base_url: "BaseURL",
		token: "Token",
		email: "Email",
	},
	[Integrations.confluence]: {
		base_url: "BaseURL",
		token: "Token",
		email: "Email",
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
