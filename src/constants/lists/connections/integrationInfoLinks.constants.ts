/* eslint-disable max-len */
import i18n from "i18next";

let infoGithubLinks: { url: string; text: string }[] = [];
let infoGoogleUserLinks: { url: string; text: string }[] = [];
let infoGoogleAccountLinks: { url: string; text: string }[] = [];
let infoTwilioLinks: { url: string; text: string }[] = [];

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

	infoTwilioLinks = [
		{
			url: "https://www.twilio.com/docs/glossary/what-is-an-api-key",
			text: i18n.t("twilio.information.aboutAuth", { ns: "integrations" }),
		},
		{
			url: "https://www.twilio.com/docs/iam/api-keys",
			text: i18n.t("twilio.information.apiOverview", { ns: "integrations" }),
		},
	];
});

export { infoGithubLinks, infoGoogleUserLinks, infoGoogleAccountLinks, infoTwilioLinks };
