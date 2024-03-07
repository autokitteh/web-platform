export interface IMenuStore {
	lastMenuUpdate: number | undefined;
	updateLastMenuTime: (newTime: number) => void;
}
