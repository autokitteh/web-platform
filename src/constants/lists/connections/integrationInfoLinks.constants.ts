/* eslint-disable max-len */
import i18n from "i18next";

let infoGithubLinks: { url: string; text: string }[] = [];
let infoGoogleUserLinks: { url: string; text: string }[] = [];
let infoGoogleAccountLinks: { url: string; text: string }[] = [];
let infoSlackModeLinks: { url: string; text: string }[] = [];
let infoSlackOAuthLinks: { url: string; text: string }[] = [];

i18n.on("initialized", () => {
	infoGithubLinks = [
		{
			url: "https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28#authenticating-with-a-personal-access-token",
			text: i18n.t("github.informationPat.auth", { ns: "integrations" }),
		},
		{
			url: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",
			text: i18n.t("github.informationPat.manage", { ns: "integrations" }),
		},
		{
			url: "https://docs.github.com/en/organizations/managing-programmatic-access-to-your-organization/setting-a-personal-access-token-policy-for-your-organization",
			text: i18n.t("github.informationPat.setting", { ns: "integrations" }),
		},
		{
			url: "https://docs.github.com/en/rest/authentication/endpoints-available-for-fine-grained-personal-access-tokens",
			text: i18n.t("github.informationPat.endpoints", { ns: "integrations" }),
		},
	];

	infoGoogleUserLinks = [
		{
			url: "https://developers.google.com/workspace/guides/auth-overview",
			text: i18n.t("google.information.aboutAuth", { ns: "integrations" }),
		},
		{
			url: "https://developers.google.com/identity/protocols/oauth2/web-server",
			text: i18n.t("google.information.uisingOAuth", { ns: "integrations" }),
		},
	];

	infoGoogleAccountLinks = [
		{
			url: "https://cloud.google.com/iam/docs/service-account-overview",
			text: i18n.t("google.information.gcp", { ns: "integrations" }),
		},
		{
			url: "https://cloud.google.com/iam/docs/service-account-creds",
			text: i18n.t("google.information.credentials", { ns: "integrations" }),
		},
		{
			url: "https://cloud.google.com/iam/docs/keys-create-delete",
			text: i18n.t("google.information.serviceAccount", { ns: "integrations" }),
		},
		{
			url: "https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys",
			text: i18n.t("google.information.managingAccount", { ns: "integrations" }),
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
});

export { infoGithubLinks, infoGoogleUserLinks, infoGoogleAccountLinks, infoSlackModeLinks, infoSlackOAuthLinks };
