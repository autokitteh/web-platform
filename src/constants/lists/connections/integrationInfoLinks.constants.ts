import i18n, { t } from "i18next";

let infoGithubLinks: { text: string; url: string }[] = [];
let infoGoogleUserLinks: { text: string; url: string }[] = [];
let infoGoogleAccountLinks: { text: string; url: string }[] = [];
let infoSlackModeLinks: { text: string; url: string }[] = [];
let infoSlackOAuthLinks: { text: string; url: string }[] = [];
let infoOpenAiLinks: { text: string; url: string }[] = [];
let infoHttpBasicLinks: { text: string; url: string }[] = [];
let infoHttpBearerLinks: { text: string; url: string }[] = [];
let infoTwilioLinks: { text: string; url: string }[] = [];
let infoConfluenceLinks: { text: string; url: string }[] = [];
let infoJiraLinks: { text: string; url: string }[] = [];
let infoGithubPrivateOAuthLinks: { text: string; url: string }[] = [];
let infoGithubDefaultOAuthLinks: { text: string; url: string }[] = [];
let infoZoomLinks: { text: string; url: string }[] = [];
let infoSalesforceDefaultLinks: { text: string; url: string }[] = [];
let infoSalesforcePrivateLinks: { text: string; url: string }[] = [];
let infoMicrosoftDefaultUserLinks: { text: string; url: string }[] = [];
let infoMicrosoftPrivateUserLinks: { text: string; url: string }[] = [];
let infoMicrosoftDaemonLinks: { text: string; url: string }[] = [];
let infoMicrosoftApiKeyLinks: { text: string; url: string }[] = [];
let infoLinearDefaultOAuthLinks: { text: string; url: string }[] = [];
let infoLinearPrivateOAuthLinks: { text: string; url: string }[] = [];
let infoLinearApiKeyLinks: { text: string; url: string }[] = [];
let infoHubspotLinks: { text: string; url: string }[] = [];
let infoHeightLinks: { text: string; url: string }[] = [];
let infoGoogleFormsLinks: { text: string; url: string }[] = [];
let infoGoogleCalendarLinks: { text: string; url: string }[] = [];
let infoGoogleGeminiLinks: { text: string; url: string }[] = [];
let infoDiscordLinks: { text: string; url: string }[] = [];
let infoAwsLinks: { text: string; url: string }[] = [];
let infoAuth0Links: { text: string; url: string }[] = [];
let infoAsanaLinks: { text: string; url: string }[] = [];

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

	infoGithubPrivateOAuthLinks = [
		{
			text: t("github.informationPrivate.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/github/private_app",
		},
		{
			text: t("github.informationPrivate.oauthGuide", { ns: "integrations" }),
			url: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps",
		},
	];
	infoGithubDefaultOAuthLinks = [
		{
			text: t("github.information.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/github/default_app",
		},
		{
			text: t("github.information.oauthGuide", { ns: "integrations" }),
			url: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps",
		},
	];

	infoGoogleUserLinks = [
		{
			text: t("google.information.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/google/config",
		},
		{
			text: t("google.information.aboutAuth", { ns: "integrations" }),
			url: "https://developers.google.com/workspace/guides/auth-overview",
		},
		{
			text: t("google.information.usingOAuth", { ns: "integrations" }),
			url: "https://developers.google.com/identity/protocols/oauth2/web-server",
		},
	];

	infoGoogleAccountLinks = [
		{
			text: t("google.information.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/google/config",
		},
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

	infoHttpBasicLinks = [
		{
			url: "https://datatracker.ietf.org/doc/html/rfc7617",
			text: t("http.information.rfc7617", { ns: "integrations" }),
		},
	];
	infoHttpBearerLinks = [
		{
			url: "https://datatracker.ietf.org/doc/html/rfc6750",
			text: t("http.information.rfc6750", { ns: "integrations" }),
		},
	];

	infoOpenAiLinks = [
		{
			url: "https://docs.autokitteh.com/integrations/chatgpt/connection",
			text: t("openAi.information.akGuide", { ns: "integrations" }),
		},
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

	infoConfluenceLinks = [
		{
			url: "https://docs.autokitteh.com/integrations/atlassian/config",
			text: t("confluence.information.akGuide", { ns: "integrations" }),
		},
		{
			text: t("confluence.information.accessTokens", { ns: "integrations" }),
			url: "https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html",
		},
	];

	infoJiraLinks = [
		{
			url: "https://docs.autokitteh.com/integrations/atlassian/config",
			text: t("jira.information.akGuide", { ns: "integrations" }),
		},
		{
			url: "https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html",
			text: t("jira.information.accessTokens", { ns: "integrations" }),
		},
	];

	infoZoomLinks = [
		{
			text: t("zoom.information.initConnection", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/zoom/connection",
		},
		{
			text: t("zoom.information.auth", { ns: "integrations" }),
			url: "https://marketplace.zoom.us/docs/guides/build/jwt-app",
		},
		{
			text: t("zoom.information.manage", { ns: "integrations" }),
			url: "https://marketplace.zoom.us/docs/guides/build/jwt-app/jwt-faq",
		},
	];

	infoSalesforceDefaultLinks = [
		{
			text: t("salesforce.informationDefault.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/salesforce",
		},
		{
			text: t("salesforce.informationDefault.oauthGuide", { ns: "integrations" }),
			url: "https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm&type=5",
		},
	];

	infoSalesforcePrivateLinks = [
		{
			text: t("salesforce.informationPrivate.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/salesforce/private_oauth",
		},
		{
			text: t("salesforce.informationPrivate.oauthGuide", { ns: "integrations" }),
			url: "https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm&type=5",
		},
	];

	infoMicrosoftDefaultUserLinks = [
		{
			text: t("microsoft.informationDefaultUser.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/microsoft/default_user",
		},
		{
			text: t("microsoft.informationDefaultUser.oauthGuide", { ns: "integrations" }),
			url: "https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow",
		},
	];

	infoMicrosoftPrivateUserLinks = [
		{
			text: t("microsoft.informationPrivateUser.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/microsoft/private_user",
		},
		{
			text: t("microsoft.informationPrivateUser.oauthGuide", { ns: "integrations" }),
			url: "https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow",
		},
	];

	infoMicrosoftDaemonLinks = [
		{
			text: t("microsoft.informationDaemon.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/microsoft/daemon",
		},
		{
			text: t("microsoft.informationDaemon.oauthGuide", { ns: "integrations" }),
			url: "https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow",
		},
	];

	infoMicrosoftApiKeyLinks = [
		{
			text: t("microsoft.informationApiKey.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/microsoft/api_key",
		},
		{
			text: t("microsoft.informationApiKey.apiOath", { ns: "integrations" }),
			url: "https://learn.microsoft.com/en-us/graph/auth/auth-concepts",
		},
	];

	infoLinearDefaultOAuthLinks = [
		{
			text: t("linear.informationDefaultOAuth.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/linear/default_oauth",
		},
		{
			text: t("linear.informationDefaultOAuth.apiOath", { ns: "integrations" }),
			url: "https://linear.app/developers/oauth-2-0-authentication",
		},
		{
			text: t("linear.informationDefaultOAuth.apiOathActor", { ns: "integrations" }),
			url: "https://linear.app/developers/oauth-actor-authorization",
		},
	];

	infoLinearPrivateOAuthLinks = [
		{
			text: t("linear.informationPrivateOAuth.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/linear/private_oauth",
		},
		{
			text: t("linear.informationPrivateOAuth.apiOath", { ns: "integrations" }),
			url: "https://linear.app/developers/oauth-2-0-authentication",
		},
		{
			text: t("linear.informationPrivateOAuth.apiOathActor", { ns: "integrations" }),
			url: "https://linear.app/developers/oauth-actor-authorization",
		},
	];
	infoLinearApiKeyLinks = [
		{
			text: t("linear.informationApiKey.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/linear/api_key",
		},
		{
			text: t("linear.informationApiKey.apiOath", { ns: "integrations" }),
			url: "https://linear.app/docs/api-and-webhooks",
		},
	];

	infoHubspotLinks = [
		{
			text: t("hubspot.information.initConnection", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/hubspot/connection",
		},
		{
			text: t("hubspot.information.auth", { ns: "integrations" }),
			url: "https://developers.hubspot.com/docs/api/oauth-quickstart-guide",
		},
		{
			text: t("hubspot.information.manage", { ns: "integrations" }),
			url: "https://developers.hubspot.com/docs/api/oauth-quickstart-guide",
		},
	];

	infoHeightLinks = [
		{
			text: t("height.information.apiDocs", { ns: "integrations" }),
			url: "https://height.notion.site/API-documentation-643aea5bf01742de9232e5971cb4afda",
		},
		{
			text: t("height.information.auth", { ns: "integrations" }),
			url: "https://height.notion.site/OAuth-Apps-on-Height-a8ebeab3f3f047e3857bd8ce60c2f640",
		},
	];

	infoGoogleFormsLinks = [
		{
			text: t("googleForms.information.initConnection", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/google/forms/connection",
		},
		{
			text: t("googleForms.information.auth", { ns: "integrations" }),
			url: "https://developers.google.com/forms/api/guides/authorization",
		},
		{
			text: t("googleForms.information.manage", { ns: "integrations" }),
			url: "https://developers.google.com/forms/api/guides/authorization",
		},
	];

	infoGoogleCalendarLinks = [
		{
			text: t("googleCalendar.information.initConnection", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/google/calendar/connection",
		},
		{
			text: t("googleCalendar.information.auth", { ns: "integrations" }),
			url: "https://developers.google.com/calendar/api/guides/auth",
		},
		{
			text: t("googleCalendar.information.manage", { ns: "integrations" }),
			url: "https://developers.google.com/calendar/api/guides/auth",
		},
	];

	infoGoogleGeminiLinks = [
		{
			text: t("googleGemini.information.initConnection", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/google/gemini/connection",
		},
		{
			text: t("googleGemini.information.auth", { ns: "integrations" }),
			url: "https://ai.google.dev/docs/authentication",
		},
		{
			text: t("googleGemini.information.manage", { ns: "integrations" }),
			url: "https://ai.google.dev/docs/authentication",
		},
	];

	infoDiscordLinks = [
		{
			text: t("discord.information.initConnection", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/discord/connection",
		},
		{
			text: t("discord.information.auth", { ns: "integrations" }),
			url: "https://discord.com/developers/docs/topics/oauth2",
		},
		{
			text: t("discord.information.manage", { ns: "integrations" }),
			url: "https://discord.com/developers/docs/topics/oauth2",
		},
	];

	infoAwsLinks = [
		{
			text: t("aws.information.credentials", { ns: "integrations" }),
			url: "https://docs.aws.amazon.com/sdkref/latest/guide/feature-static-credentials.html",
		},
	];

	infoAuth0Links = [
		{
			text: t("auth0.information.akGuide", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/auth0",
		},
		{
			text: t("auth0.information.oauthGuide", { ns: "integrations" }),
			url: "https://auth0.com/docs/get-started/applications/application-settings",
		},
	];

	infoAsanaLinks = [
		{
			text: t("asana.information.initConnection", { ns: "integrations" }),
			url: "https://docs.autokitteh.com/integrations/asana/connection",
		},
		{
			text: t("asana.information.asanaPat", { ns: "integrations" }),
			url: "https://developers.asana.com/docs/personal-access-token",
		},
	];
});

export {
	infoGithubLinks,
	infoGoogleUserLinks,
	infoGoogleAccountLinks,
	infoSlackModeLinks,
	infoSlackOAuthLinks,
	infoOpenAiLinks,
	infoHttpBasicLinks,
	infoHttpBearerLinks,
	infoTwilioLinks,
	infoConfluenceLinks,
	infoJiraLinks,
	infoGithubPrivateOAuthLinks,
	infoGithubDefaultOAuthLinks,
	infoZoomLinks,
	infoSalesforceDefaultLinks,
	infoSalesforcePrivateLinks,
	infoMicrosoftDefaultUserLinks,
	infoMicrosoftPrivateUserLinks,
	infoMicrosoftDaemonLinks,
	infoMicrosoftApiKeyLinks,
	infoLinearDefaultOAuthLinks,
	infoLinearPrivateOAuthLinks,
	infoLinearApiKeyLinks,
	infoHubspotLinks,
	infoHeightLinks,
	infoGoogleFormsLinks,
	infoGoogleCalendarLinks,
	infoGoogleGeminiLinks,
	infoDiscordLinks,
	infoAwsLinks,
	infoAuth0Links,
	infoAsanaLinks,
};
