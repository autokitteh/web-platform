import { CellMeasurerCache, List, ListRowProps } from "react-virtualized";

export interface VirtualizedListHookResult<T> {
	items: T[];
	loading: boolean;
	isRowLoaded: (params: { index: number }) => boolean;
	loadMoreRows: (params: { startIndex: number; stopIndex: number }) => Promise<void>;
	handleScroll: (params: { scrollTop: number }) => void;
	cache: CellMeasurerCache;
	listRef: React.MutableRefObject<List | null>;
	frameRef: React.RefObject<HTMLDivElement>;
	t: (key: string) => string;
	nextPageToken: string | null;
	rowRenderer: (props: ListRowProps) => React.ReactNode;
}