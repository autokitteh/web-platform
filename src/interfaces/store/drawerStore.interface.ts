export interface DrawerStore<T = unknown> {
	closeDrawer: (name: string) => void;
	data?: T;
	drawers: {
		[key: string]: boolean;
	};
	openDrawer: (name: string, data?: T) => void;
}
