import Cookies from "js-cookie";

import { systemCookies } from "@constants";
import { LocalStorageKeys } from "@src/enums";
import { deleteLocalStorageValue } from "@src/utilities";

export async function clearAuthCookies(): Promise<void> {
	deleteLocalStorageValue(LocalStorageKeys.apiToken);
	Cookies.remove(systemCookies.isLoggedIn, { path: "/" });
}
