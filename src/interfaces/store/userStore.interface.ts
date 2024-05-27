import { User } from "@ak-proto-ts/users/v1/user_pb";

interface UserStoreResponse {
	error?: unknown;
	data?: unknown;
}

export interface UserStore {
	user?: User;
	whoAmI: () => Promise<UserStoreResponse & { user: User | undefined }>;
}
