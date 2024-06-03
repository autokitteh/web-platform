/* eslint-disable max-len */
import i18n from "i18next";

let infoGithubLinks: { id: number; url: string; text: string }[] = [];

i18n.on("initialized", () => {
	infoGithubLinks = [
		{
			id: 0,
			url: "https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28#authenticating-with-a-personal-access-token",
			text: i18n.t("github.informationPat.auth", { ns: "integrations" }),
		},
		{
			id: 1,
			url: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",
			text: i18n.t("github.informationPat.manage", { ns: "integrations" }),
		},
		{
			id: 2,
			url: "https://docs.github.com/en/organizations/managing-programmatic-access-to-your-organization/setting-a-personal-access-token-policy-for-your-organization",
			text: i18n.t("github.informationPat.setting", { ns: "integrations" }),
		},
		{
			id: 3,
			url: "https://docs.github.com/en/rest/authentication/endpoints-available-for-fine-grained-personal-access-tokens",
			text: i18n.t("github.informationPat.endpoints", { ns: "integrations" }),
		},
	];
});

export { infoGithubLinks };
