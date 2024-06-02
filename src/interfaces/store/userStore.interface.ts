import { User } from "@type/models";

interface UserStoreResponse {
	error?: unknown;
	data?: unknown;
}

export interface UserStore {
	user?: User;
	getLoggedInUser: () => Promise<UserStoreResponse & { user?: User }>;
}
