import deployments from "@i18n/en/deployments.i18n.json";
import errors from "@i18n/en/errors.i18n.json";
import general from "@i18n/en/general.i18n.json";
import manifest from "@i18n/en/manifest.i18n.json";
import messages from "@i18n/en/messages.i18n.json";
import projects from "@i18n/en/projects.i18n.json";
import reactAppDeployments from "@i18n/en/reactApp/deployments.reactApp.i18n.json";
import reactAppGeneral from "@i18n/en/reactApp/general.reactApp.i18n.json";
import reactAppSessions from "@i18n/en/reactApp/sessions.reactApp.i18n.json";
import sessions from "@i18n/en/sessions.i18n.json";
import walkthrough from "@i18n/en/walkthrough.i18n.json";

export const english = {
	errors,
	projects,
	messages,
	general,
	walkthrough,
	manifest,
	sessions,
	deployments,
	reactApp: {
		general: reactAppGeneral,
		deployments: reactAppDeployments,
		sessions: reactAppSessions,
	},
};
