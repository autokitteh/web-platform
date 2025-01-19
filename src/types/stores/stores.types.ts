export type StoreResponse<ResponseType> = {
	data: ResponseType | undefined;
	error: boolean | undefined;
};
