import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { IntegrationsMap } from "@src/enums/components/connection.enum";

export const integrationTypes: SelectOption[] = Object.values(IntegrationsMap);

export const integrationIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = Object.fromEntries(
	Object.entries(IntegrationsMap)
		.filter(([_, value]) => value.icon !== undefined)
		.map(([key, value]) => [key, value.icon!])
);

export const githubIntegrationAuthMethods: SelectOption[] = [
	{ label: "GitHub App", value: ConnectionAuthType.Oauth },
	{ label: "PAT + Webhook", value: ConnectionAuthType.Pat },
];

export const selectIntegrationGoogle: SelectOption[] = [
	{ label: "User (OAuth v2)", value: ConnectionAuthType.Oauth },
	{ label: "Service Account (JSON Key)", value: ConnectionAuthType.JsonKey },
];

export const selectIntegrationSlack: SelectOption[] = [
	{ label: "OAuth v2", value: ConnectionAuthType.Oauth },
	{ label: "Socket Mode", value: ConnectionAuthType.Socket },
];

export const selectIntegrationAws: SelectOption[] = [
	{ value: "ap-northeast-1", label: "ap-northeast-1" },
	{ value: "ap-northeast-2", label: "ap-northeast-2" },
	{ value: "ap-northeast-3", label: "ap-northeast-3" },
	{ value: "ap-south-1", label: "ap-south-1" },
	{ value: "ap-southeast-1", label: "ap-southeast-1" },
	{ value: "ap-southeast-2", label: "ap-southeast-2" },
	{ value: "ca-central-1", label: "ca-central-1" },
	{ value: "eu-central-1", label: "eu-central-1" },
	{ value: "eu-north-1", label: "eu-north-1" },
	{ value: "eu-west-1", label: "eu-west-1" },
	{ value: "eu-west-2", label: "eu-west-2" },
	{ value: "eu-west-3", label: "eu-west-3" },
	{ value: "sa-east-1", label: "sa-east-1" },
	{ value: "us-east-1", label: "us-east-1" },
	{ value: "us-east-2", label: "us-east-2" },
	{ value: "us-west-1", label: "us-west-1" },
	{ value: "us-west-2", label: "us-west-2" },
];

export const selectIntegrationHttp: SelectOption[] = [
	{ label: "No Auth", value: ConnectionAuthType.NoAuth },
	{ label: "Basic", value: ConnectionAuthType.Basic, disabled: true },
	{ label: "Bearer", value: ConnectionAuthType.Bearer, disabled: true },
];

export const selectIntegrationTwilio: SelectOption[] = [
	{ label: "Auth Token", value: ConnectionAuthType.AuthToken },
	{ label: "API Key", value: ConnectionAuthType.ApiKey },
];

export const selectIntegrationJira: SelectOption[] = [
	{ label: "User API Token / PAT", value: ConnectionAuthType.ApiToken },
	{ label: "OAuth 2.0 App", value: ConnectionAuthType.Oauth },
];

export const selectIntegrationConfluence: SelectOption[] = [
	{ label: "User API Token / PAT", value: ConnectionAuthType.ApiToken },
	{ label: "OAuth 2.0 App", value: ConnectionAuthType.Oauth },
];
