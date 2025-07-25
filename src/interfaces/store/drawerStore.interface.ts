export interface DrawerStore {
	closeDrawer: (name: string) => void;
	drawers: {
		[key: string]: boolean;
	};
	openDrawer: (name: string) => void;
	isDrawerOpen: (name: string) => boolean;
}
