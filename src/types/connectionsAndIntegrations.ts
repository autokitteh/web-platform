import { ConnectionAuthType } from "@src/enums";

export type ConnectionAuthTypeValues = (typeof ConnectionAuthType)[keyof typeof ConnectionAuthType];
export type IntegrationOption = {
	label: string;
	value: ConnectionAuthTypeValues;
};
