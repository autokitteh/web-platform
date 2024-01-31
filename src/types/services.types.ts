import { ConnectError } from "@connectrpc/connect";

export type ServiceResponse<ResponseType> = Promise<{
	data: ResponseType | undefined;
	error: object | undefined | unknown | ConnectError | Error;
}>;
