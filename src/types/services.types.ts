import { ConnectError } from "@connectrpc/connect";

export type ServiceResponseError = ConnectError | Error | object | undefined | unknown;

export type ServiceResponse<ResponseType> = Promise<{
	data: ResponseType | undefined;
	error: ServiceResponseError;
}>;
