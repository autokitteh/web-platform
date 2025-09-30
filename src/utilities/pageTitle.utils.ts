import { PageTitles } from "@constants";

export const getPageTitleFromPath = (pathname: string): PageTitles => {
	if (pathname.startsWith("/ai")) return PageTitles.AI;
	if (pathname.startsWith("/welcome")) return PageTitles.WELCOME;
	if (pathname.startsWith("/intro")) return PageTitles.INTRO;
	if (pathname.startsWith("/chat")) return PageTitles.CHAT;
	if (pathname.startsWith("/settings") || pathname.startsWith("/organization-settings")) return PageTitles.SETTINGS;
	if (pathname.startsWith("/404")) return PageTitles.NotFound;
	if (pathname === "/") return PageTitles.HOME;
	return PageTitles.BASE;
};
