export interface IMenuStore {
	lastMenuUpdate?: number;
	updateLastMenuTime: (newTime: number) => void;
}
