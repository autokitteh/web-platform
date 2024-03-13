import { IMenuItem } from "@interfaces/components";

export interface IUIGlobalStore {
	lastMenuUpdate: number | undefined;
	menuItems: IMenuItem[];
	isFullScreen: boolean;
	toggleFullScreen: () => void;
	refreshMenu: (forceUpdate?: boolean) => Promise<void>;
}
