import { ServiceResponse } from "@type";
import { User } from "@type/models";

export interface UserStore {
	getLoggedInUser: () => ServiceResponse<User>;
	logoutFunction: () => void;
	setLogoutFunction: (logoutFn: () => void) => void;
	user?: User;
}
