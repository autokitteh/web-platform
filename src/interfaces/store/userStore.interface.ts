import { User } from "@type/models";

export interface UserStore {
	getLoggedInUser: () => Promise<string>;
	logoutFunction: () => void;
	setLogoutFunction: (logoutFn: () => void) => void;
	user?: User;
}
