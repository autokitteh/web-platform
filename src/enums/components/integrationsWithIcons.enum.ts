import {
	IntegrationForTemplates,
	Integrations,
	IntegrationsMap,
	shouldHideIntegration,
	HiddenIntegrationsForTemplates as HiddenIntegrationsMap,
} from "./integrations.enum";
import { IntegrationSelectOption } from "@src/interfaces/components/forms";

import { AKRoundLogo } from "@assets/image";
import {
	AirtableIcon,
	AnthropicIcon,
	AsanaIcon,
	Auth0Icon,
	AwsIcon,
	ConfluenceIcon,
	DiscordIcon,
	GithubCopilotIcon,
	GithubIcon,
	GoogleCalendarIcon,
	GoogleDriveIcon,
	GoogleFormsIcon,
	GoogleGeminiIcon,
	GoogleGmailIcon,
	GoogleSheetsIcon,
	GoogleYoutubeIcon,
	GrpcIcon,
	HttpIcon,
	HubspotIcon,
	JiraIcon,
	KubernetesIcon,
	LinearIcon,
	MicrosoftTeamsIcon,
	NotionIcon,
	OpenAiIcon,
	PipedriveIcon,
	RedditIcon,
	SalesforceIcon,
	SchedulerIcon,
	SlackIcon,
	SqliteIcon,
	TelegramIcon,
	TwilioIcon,
	ZoomIcon,
} from "@assets/image/icons/connections";

export const IntegrationsIcons: Record<Integrations, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
	linear: LinearIcon,
	airtable: AirtableIcon,
	auth0: Auth0Icon,
	asana: AsanaIcon,
	anthropic: AnthropicIcon,
	aws: AwsIcon,
	calendar: GoogleCalendarIcon,
	chatgpt: OpenAiIcon,
	confluence: ConfluenceIcon,
	discord: DiscordIcon,
	drive: GoogleDriveIcon,
	forms: GoogleFormsIcon,
	github: GithubIcon,
	gmail: GoogleGmailIcon,
	youtube: GoogleYoutubeIcon,
	googlegemini: GoogleGeminiIcon,
	jira: JiraIcon,
	sheets: GoogleSheetsIcon,
	slack: SlackIcon,
	twilio: TwilioIcon,
	telegram: TelegramIcon,
	hubspot: HubspotIcon,
	zoom: ZoomIcon,
	salesforce: SalesforceIcon,
	microsoft_teams: MicrosoftTeamsIcon,
	kubernetes: KubernetesIcon,
	reddit: RedditIcon,
	pipedrive: PipedriveIcon,
	notion: NotionIcon,
};

export const HiddenIntegrationsIconsForTemplates: Record<
	IntegrationForTemplates,
	React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
	githubcopilot: GithubCopilotIcon,
	sqlite3: SqliteIcon,
	scheduler: SchedulerIcon,
	http: HttpIcon,
	autokitteh: AKRoundLogo,
	grpc: GrpcIcon,
};

export const fitleredIntegrationsMap = Object.fromEntries(
	Object.entries(IntegrationsMap)
		.filter(([key]) => {
			const integration = key as Integrations;
			return integration in IntegrationsIcons && !shouldHideIntegration[integration];
		})
		.map(([key, value]) => {
			const integration = key as Integrations;
			return [
				key,
				{
					...value,
					icon: IntegrationsIcons[integration],
				},
			];
		})
) as Record<Integrations, IntegrationSelectOption>;

export const filteredHiddenIntegrationsWithIconsForTemplates = Object.fromEntries(
	Object.entries(HiddenIntegrationsMap)
		.filter(([key]) => {
			const integration = key as IntegrationForTemplates;
			return integration in HiddenIntegrationsIconsForTemplates;
		})
		.map(([key, value]) => {
			const integration = key as IntegrationForTemplates;
			return [
				key,
				{
					...value,
					icon: HiddenIntegrationsIconsForTemplates[integration],
				},
			];
		})
) as Record<IntegrationForTemplates, IntegrationSelectOption>;

export const allIntegrationsWithIcons = {
	...fitleredIntegrationsMap,
	...filteredHiddenIntegrationsWithIconsForTemplates,
} as Record<Integrations | IntegrationForTemplates, IntegrationSelectOption>;
