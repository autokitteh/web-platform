import Cookies from "js-cookie";

import { isLoggedInCookie } from "@constants";
import { LocalStorageKeys } from "@src/enums";
import { setLocalStorageValue } from "@src/utilities";

export function clearAuthCookies() {
	setLocalStorageValue(LocalStorageKeys.apiToken, "");
	Cookies.remove(isLoggedInCookie, { path: "/" });
}
