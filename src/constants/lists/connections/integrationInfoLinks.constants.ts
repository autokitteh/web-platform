import i18n, { t } from "i18next";

let infoGithubLinks: { text: string; url: string }[] = [];
let infoGoogleUserLinks: { text: string; url: string }[] = [];
let infoGoogleAccountLinks: { text: string; url: string }[] = [];
let infoSlackModeLinks: { text: string; url: string }[] = [];
let infoSlackOAuthLinks: { text: string; url: string }[] = [];
let infoOpenAiLinks: { text: string; url: string }[] = [];
let infoTwilioLinks: { text: string; url: string }[] = [];
let infoTelegramLinks: { text: string; url: string }[] = [];
let infoConfluenceLinks: { text: string; url: string }[] = [];
let infoJiraLinks: { text: string; url: string }[] = [];
let infoRedditLinks: { text: string; url: string }[] = [];
let infoPipedriveLinks: { text: string; url: string }[] = [];
let infoAirtableLinks: { text: string; url: string }[] = [];
let infoChatGPTLinks: { text: string; url: string }[] = [];

i18n.on("initialized", () => {
	infoGithubLinks = [
		{
			text: t("github.informationPat.initConnection", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/github/connection",
		},
		{
			text: t("github.informationPat.auth", { ns: "integrations" }),
			url: "https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28#authenticating-with-a-personal-access-token",
		},
		{
			text: t("github.informationPat.manage", { ns: "integrations" }),
			url: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",
		},
		{
			text: t("github.informationPat.setting", { ns: "integrations" }),
			url: "https://docs.github.com/en/organizations/managing-programmatic-access-to-your-organization/setting-a-personal-access-token-policy-for-your-organization",
		},
		{
			text: t("github.informationPat.endpoints", { ns: "integrations" }),
			url: "https://docs.github.com/en/rest/authentication/endpoints-available-for-fine-grained-personal-access-tokens",
		},
	];

	infoGoogleUserLinks = [
		{
			text: t("google.information.aboutAuth", { ns: "integrations" }),
			url: "https://developers.google.com/workspace/guides/auth-overview",
		},
		{
			text: t("google.information.uisingOAuth", { ns: "integrations" }),
			url: "https://developers.google.com/identity/protocols/oauth2/web-server",
		},
	];

	infoGoogleAccountLinks = [
		{
			text: t("google.information.gcp", { ns: "integrations" }),
			url: "https://cloud.google.com/iam/docs/service-account-overview",
		},
		{
			text: t("google.information.credentials", { ns: "integrations" }),
			url: "https://cloud.google.com/iam/docs/service-account-creds",
		},
		{
			text: t("google.information.serviceAccount", { ns: "integrations" }),
			url: "https://cloud.google.com/iam/docs/keys-create-delete",
		},
		{
			text: t("google.information.managingAccount", { ns: "integrations" }),
			url: "https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys",
		},
	];

	infoSlackModeLinks = [
		{
			url: "https://docs.autokitteh.com/tutorials/new_connections/slack",
			text: t("slack.information.AKGuide", { ns: "integrations" }),
		},
		{
			url: "https://api.slack.com/apis/connections/socket",
			text: t("slack.information.aboutMode", { ns: "integrations" }),
		},
	];
	infoSlackOAuthLinks = [
		{
			url: "https://docs.autokitteh.com/integrations/slack/config",
			text: t("slack.information.configSlack", { ns: "integrations" }),
		},
		{
			url: "https://api.slack.com/authentication/oauth-v2",
			text: t("slack.information.aboutInitSlack", { ns: "integrations" }),
		},
	];

	infoOpenAiLinks = [
		{
			url: "https://platform.openai.com/",
			text: t("openAi.information.openAI", { ns: "integrations" }),
		},
		{
			url: "https://platform.openai.com/api-keys",
			text: t("openAi.information.apiKeys", { ns: "integrations" }),
		},
	];

	infoTwilioLinks = [
		{
			url: "https://www.twilio.com/docs/glossary/what-is-an-api-key",
			text: t("twilio.information.aboutAuth", { ns: "integrations" }),
		},
		{
			url: "https://www.twilio.com/docs/iam/api-keys",
			text: t("twilio.information.apiOverview", { ns: "integrations" }),
		},
	];

	infoTelegramLinks = [
		{
			url: "https://core.telegram.org/bots/api",
			text: t("telegram.information.botApi", { ns: "integrations" }),
		},
		{
			url: "https://core.telegram.org/bots/tutorial#obtain-your-bot-token",
			text: t("telegram.information.createBot", { ns: "integrations" }),
		},
	];

	infoConfluenceLinks = [
		{
			url: "https://id.atlassian.com/manage-profile/security/api-tokens",
			text: t("confluence.information.apiTokens", { ns: "integrations" }),
		},
		{
			url: "https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html",
			text: t("confluence.information.accessTokens", { ns: "integrations" }),
		},
	];

	infoJiraLinks = [
		{
			url: "https://id.atlassian.com/manage-profile/security/api-tokens",
			text: t("jira.information.apiTokens", { ns: "integrations" }),
		},
		{
			url: "https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html",
			text: t("jira.information.accessTokens", { ns: "integrations" }),
		},
	];

	infoRedditLinks = [
		{
			url: "https://www.reddit.com/r/reddit.com/wiki/api/",
			text: t("reddit.information.apiDocumentation", { ns: "integrations" }),
		},
	];

	infoPipedriveLinks = [
		{
			url: "https://pipedrive.readme.io/docs/core-api-concepts-authentication",
			text: t("pipedrive.information.authentication", { ns: "integrations" }),
		},
		{
			url: "https://support.pipedrive.com/en/article/how-can-i-find-my-personal-api-key",
			text: t("pipedrive.information.apiKey", { ns: "integrations" }),
		},
	];

	infoAirtableLinks = [
		{
			url: "https://airtable.com/developers/web/api/introduction",
			text: t("airtable.information.apiDocumentation", { ns: "integrations" }),
		},
		{
			url: "https://airtable.com/developers/web/api/oauth-reference",
			text: t("airtable.information.oauthDocumentation", { ns: "integrations" }),
		},
	];

	infoChatGPTLinks = [
		{
			url: "https://platform.openai.com/docs/plugins/introduction",
			text: t("chatgpt.information.pluginsDocumentation", { ns: "integrations" }),
		},
	];
});

export {
	infoGithubLinks,
	infoGoogleAccountLinks,
	infoGoogleUserLinks,
	infoSlackModeLinks,
	infoSlackOAuthLinks,
	infoOpenAiLinks,
	infoTwilioLinks,
	infoTelegramLinks,
	infoConfluenceLinks,
	infoJiraLinks,
	infoRedditLinks,
	infoPipedriveLinks,
	infoAirtableLinks,
	infoChatGPTLinks,
};
