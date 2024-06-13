import { GithubConnectionType, GoogleConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";

export const selectIntegrations: SelectOption[] = [
	{ value: "github", label: "Github", disabled: false },
	{ value: "google", label: "Google (All APIs)", disabled: false },
	{ value: "aws", label: "AWS", disabled: false },
];

export const selectIntegrationGithub: SelectOption[] = [
	{ value: GithubConnectionType.Pat, label: "Personal Access Token (PAT)" },
	{ value: GithubConnectionType.Oauth, label: "OAuth" },
];

export const selectIntegrationGoogle: SelectOption[] = [
	{ value: GoogleConnectionType.Oauth, label: "User (OAuth v2)" },
	{ value: GoogleConnectionType.ServiceAccount, label: "Service Account (JSON Key)" },
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
