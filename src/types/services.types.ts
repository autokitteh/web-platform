import { ConnectError } from "@connectrpc/connect";
import { ErrorCodes } from "@src/enums/errorCodes.enum";

export type ServiceResponseError = ConnectError | Error | undefined | unknown;

export const errorPayloadMap = {
	[ErrorCodes.lintFailed]: {
		warnings: 0,
		errors: 0,
	},
	[ErrorCodes.buildSucceed]: {
		warnings: 0,
	},
	[ErrorCodes.buildFailed]: {
		warnings: 0,
	},
	[ErrorCodes.deploySucceed]: {
		warnings: 0,
	},
	[ErrorCodes.deployFailed]: {
		warnings: 0,
	},
};

export type ErrorPayloadMap = typeof errorPayloadMap;

export type Metadata =
	| { code: ErrorCodes.lintFailed; payload: { errors: number; warnings: number } }
	| { code: ErrorCodes.buildFailed; payload: { warnings: number } }
	| { code: ErrorCodes.buildSucceed; payload: { warnings: number } }
	| { code: ErrorCodes.deploySucceed; payload: { warnings: number } }
	| { code: ErrorCodes.deployFailed; payload: { warnings: number } };

export type ServiceResponse<T> = Promise<{
	data: T | undefined;
	error?: ServiceResponseError;
	metadata?: Metadata;
}>;
