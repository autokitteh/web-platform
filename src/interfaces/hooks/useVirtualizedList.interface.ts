import { CellMeasurerCache, List, ListRowProps } from "react-virtualized";

export interface VirtualizedListHookResult<T> {
	items: T[];
	isRowLoaded: (params: { index: number }) => boolean;
	loadMoreRows: () => Promise<void>;
	cache: CellMeasurerCache;
	listRef: React.MutableRefObject<List | null>;
	frameRef: React.RefObject<HTMLDivElement>;
	t: (key: string) => string;
	nextPageToken: string | null;
	rowRenderer: (props: ListRowProps) => React.ReactNode;
	loading: boolean;
}
