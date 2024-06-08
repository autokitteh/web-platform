import { ServiceResponse } from "@type";
import { User } from "@type/models";

export interface UserStore {
	user?: User;
	getLoggedInUser: () => ServiceResponse<User>;
	reset: () => void;
	logoutFunction: () => void;
	setLogoutFunction: (logoutFn: () => void) => void;
}
