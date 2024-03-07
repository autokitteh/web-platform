export interface IUIGlobalStore {
	lastMenuUpdate: number | undefined;
	isFullScreen: boolean;
	toggleFullScreen: () => void;
	updateLastMenuTime: (newTime: number) => void;
}
