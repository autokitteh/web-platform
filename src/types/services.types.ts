import { ConnectError } from "@connectrpc/connect";

export type ServiceResponse<ResponseType> = Promise<{
	data: ResponseType | undefined;
	error: ConnectError | Error | object | undefined | unknown;
}>;
