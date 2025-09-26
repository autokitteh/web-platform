import Cookies from "js-cookie";

import { systemCookies } from "@constants";
import { LocalStorageKeys } from "@src/enums";
import { setLocalStorageValue } from "@src/utilities";

export async function clearAuthCookies(): Promise<void> {
	await setLocalStorageValue(LocalStorageKeys.apiToken, "");
	Cookies.remove(systemCookies.isLoggedIn, { path: "/" });
}
