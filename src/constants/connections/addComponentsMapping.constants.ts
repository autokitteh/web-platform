import { Integrations } from "@src/enums/components";

import { AsanaIntegrationAddForm } from "@components/organisms/connections/integrations/asana/add";
import { Auth0IntegrationAddForm } from "@components/organisms/connections/integrations/auth0/add";
import { AwsIntegrationAddForm } from "@components/organisms/connections/integrations/aws/add";
import { ConfluenceIntegrationAddForm } from "@components/organisms/connections/integrations/confluence/add";
import { DiscordIntegrationAddForm } from "@components/organisms/connections/integrations/discord/add";
import { GithubIntegrationAddForm } from "@components/organisms/connections/integrations/github/add";
import { GoogleIntegrationAddForm } from "@components/organisms/connections/integrations/google/add";
import { GoogleCalendarIntegrationAddForm } from "@components/organisms/connections/integrations/googlecalendar/add";
import { GoogleFormsIntegrationAddForm } from "@components/organisms/connections/integrations/googleforms/add";
import { GoogleGeminiIntegrationAddForm } from "@components/organisms/connections/integrations/googleGemini/add";
import { HeightIntegrationAddForm } from "@components/organisms/connections/integrations/height/add";
import { HubspotIntegrationAddForm } from "@components/organisms/connections/integrations/hubspot/add";
import { JiraIntegrationAddForm } from "@components/organisms/connections/integrations/jira/add";
import { LinearIntegrationAddForm } from "@components/organisms/connections/integrations/linear/add";
import { MicrosoftTeamsIntegrationAddForm } from "@components/organisms/connections/integrations/microsoft/teams";
import { OpenAiIntegrationAddForm } from "@components/organisms/connections/integrations/openai/add";
import { SalesforceIntegrationAddForm } from "@components/organisms/connections/integrations/salesforce/add";
import { SlackIntegrationAddForm } from "@components/organisms/connections/integrations/slack/add";
import { TwilioIntegrationAddForm } from "@components/organisms/connections/integrations/twilio/add";
import { ZoomIntegrationAddForm } from "@components/organisms/connections/integrations/zoom/add";

export const integrationAddFormComponents: Partial<Record<keyof typeof Integrations, React.ComponentType<any>>> = {
	auth0: Auth0IntegrationAddForm,
	asana: AsanaIntegrationAddForm,
	github: GithubIntegrationAddForm,
	slack: SlackIntegrationAddForm,
	gmail: GoogleIntegrationAddForm,
	sheets: GoogleIntegrationAddForm,
	calendar: GoogleCalendarIntegrationAddForm,
	drive: GoogleIntegrationAddForm,
	forms: GoogleFormsIntegrationAddForm,
	googlegemini: GoogleGeminiIntegrationAddForm,
	aws: AwsIntegrationAddForm,
	chatgpt: OpenAiIntegrationAddForm,
	twilio: TwilioIntegrationAddForm,
	jira: JiraIntegrationAddForm,
	confluence: ConfluenceIntegrationAddForm,
	discord: DiscordIntegrationAddForm,
	hubspot: HubspotIntegrationAddForm,
	height: HeightIntegrationAddForm,
	zoom: ZoomIntegrationAddForm,
	linear: LinearIntegrationAddForm,
	salesforce: SalesforceIntegrationAddForm,
	microsoft_teams: MicrosoftTeamsIntegrationAddForm,
};
