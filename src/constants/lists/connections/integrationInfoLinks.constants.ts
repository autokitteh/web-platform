import i18n from "i18next";

let infoGithubLinks: { text: string; url: string }[] = [];
let infoGoogleUserLinks: { text: string; url: string }[] = [];
let infoGoogleAccountLinks: { text: string; url: string }[] = [];
let infoSlackModeLinks: { text: string; url: string }[] = [];
let infoSlackOAuthLinks: { text: string; url: string }[] = [];
let infoOpenAiLinks: { text: string; url: string }[] = [];
let infoHttpBasicLinks: { text: string; url: string }[] = [];
let infoHttpBearerLinks: { text: string; url: string }[] = [];

i18n.on("initialized", () => {
	infoGithubLinks = [
		{
			text: i18n.t("github.informationPat.auth", { ns: "integrations" }),
			url: "https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28#authenticating-with-a-personal-access-token",
		},
		{
			text: i18n.t("github.informationPat.manage", { ns: "integrations" }),
			url: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",
		},
		{
			text: i18n.t("github.informationPat.setting", { ns: "integrations" }),
			url: "https://docs.github.com/en/organizations/managing-programmatic-access-to-your-organization/setting-a-personal-access-token-policy-for-your-organization",
		},
		{
			text: i18n.t("github.informationPat.endpoints", { ns: "integrations" }),
			url: "https://docs.github.com/en/rest/authentication/endpoints-available-for-fine-grained-personal-access-tokens",
		},
	];

	infoGoogleUserLinks = [
		{
			text: i18n.t("google.information.aboutAuth", { ns: "integrations" }),
			url: "https://developers.google.com/workspace/guides/auth-overview",
		},
		{
			text: i18n.t("google.information.uisingOAuth", { ns: "integrations" }),
			url: "https://developers.google.com/identity/protocols/oauth2/web-server",
		},
	];

	infoGoogleAccountLinks = [
		{
			text: i18n.t("google.information.gcp", { ns: "integrations" }),
			url: "https://cloud.google.com/iam/docs/service-account-overview",
		},
		{
			text: i18n.t("google.information.credentials", { ns: "integrations" }),
			url: "https://cloud.google.com/iam/docs/service-account-creds",
		},
		{
			text: i18n.t("google.information.serviceAccount", { ns: "integrations" }),
			url: "https://cloud.google.com/iam/docs/keys-create-delete",
		},
		{
			text: i18n.t("google.information.managingAccount", { ns: "integrations" }),
			url: "https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys",
		},
	];

	infoSlackModeLinks = [
		{
			url: "https://docs.autokitteh.com/tutorials/new_connections/slack",
			text: i18n.t("slack.information.AKGuide", { ns: "integrations" }),
		},
		{
			url: "https://api.slack.com/apis/connections/socket",
			text: i18n.t("slack.information.aboutMode", { ns: "integrations" }),
		},
	];
	infoSlackOAuthLinks = [
		{
			url: "https://docs.autokitteh.com/config/integrations/slack",
			text: i18n.t("slack.information.configSlack", { ns: "integrations" }),
		},
		{
			url: "https://api.slack.com/authentication/oauth-v2",
			text: i18n.t("slack.information.aboutInitSlack", { ns: "integrations" }),
		},
	];

	infoHttpBasicLinks = [
		{
			url: "https://datatracker.ietf.org/doc/html/rfc7617",
			text: i18n.t("http.information.rfc7617", { ns: "integrations" }),
		},
	];
	infoHttpBearerLinks = [
		{
			url: "https://datatracker.ietf.org/doc/html/rfc6750",
			text: i18n.t("http.information.rfc6750", { ns: "integrations" }),
		},
	];

	infoOpenAiLinks = [
		{
			url: "https://platform.openai.com/",
			text: i18n.t("openAi.information.openAI", { ns: "integrations" }),
		},
		{
			url: "https://platform.openai.com/api-keys",
			text: i18n.t("openAi.information.apiKeys", { ns: "integrations" }),
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
	infoHttpBasicLinks,
	infoHttpBearerLinks,
};
