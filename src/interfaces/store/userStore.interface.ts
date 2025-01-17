import { UserStatusType } from "@src/enums";
import { ServiceResponse } from "@src/types";
import { User } from "@type/models";

export interface UserStore {
	getLoggedInUser: () => ServiceResponse<User>;
	logoutFunction: () => void;
	setLogoutFunction: (logoutFn: () => void) => void;
	user?: User;
	reset: () => void;
	createUser: (email: string, status: UserStatusType) => Promise<ServiceResponse<string>>;
	getUser: ({ email, userId }: { email?: string; userId?: string }) => Promise<ServiceResponse<User>>;
}
