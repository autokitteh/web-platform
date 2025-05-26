export interface VirtualizedListHookResult<T> {
	items: T[];
	isRowLoaded: (params: { index: number }) => boolean;
	loadMoreRows: () => Promise<void>;
	frameRef: React.RefObject<HTMLDivElement | null>;
	t: (key: string) => string;
	nextPageToken: string | null;
	loading?: boolean;
}
