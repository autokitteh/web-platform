import { Integrations } from "@src/enums/components";

export const integrationVariablesMapping = {
	[Integrations.github]: {
		pat: "pat",
		secret: "pat_secret",
		webhook_secret: "webhook_secret",
		client_id: "client_id",
		client_secret: "client_secret",
		app_id: "app_id",
		enterprise_url: "enterprise_url",
		private_key: "private_key",
		app_name: "app_name",
	},
	[Integrations.auth0]: {
		client_id: "client_id",
		client_secret: "client_secret",
		auth0_domain: "auth0_domain",
	},
	[Integrations.slack]: {
		bot_token: "botToken",
		app_token: "appToken",
	},
	[Integrations.twilio]: {
		account_sid: "AccountSID",
		api_key: "Username",
		api_secret: "Password",
		auth_token: "Password",
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
	[Integrations.youtube]: {
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
	[Integrations.anthropic]: {
		api_key: "api_key",
	},
	[Integrations.pydanticgw]: {
		api_key: "api_key",
	},
	[Integrations.salesforce]: {
		client_id: "client_id",
		client_secret: "client_secret",
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
	[Integrations.telegram]: {
		bot_token: "BotToken",
	},
	[Integrations.chatgpt]: {
		key: "apiKey",
	},
	[Integrations.linear]: {
		client_id: "private_client_id",
		client_secret: "private_client_secret",
		webhook_url: "webhook_url",
		webhook_secret: "private_webhook_secret",
		api_key: "api_key",
		actor: "actor",
	},
	[Integrations.zoom]: {
		account_id: "account_id",
		client_id: "client_id",
		client_secret: "client_secret",
		secret_token: "secret_token",
	},
	[Integrations.microsoft_teams]: {
		client_id: "client_id",
		client_secret: "client_secret",
		tenant_id: "tenant_id",
	},
	[Integrations.kubernetes]: {
		config_file: "config_file",
	},
	[Integrations.pipedrive]: {
		api_key: "api_key",
		company_domain: "company_domain",
	},
	[Integrations.reddit]: {
		client_id: "client_id",
		client_secret: "client_secret",
		user_agent: "user_agent",
		username: "username",
		password: "password",
	},
	[Integrations.notion]: {
		apiKey: "api_key",
	},
};
