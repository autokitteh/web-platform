import { Virtualizer } from "@tanstack/react-virtual";

export interface VirtualizedSessionListHook<T> {
	items: T[];
	loadMoreRows: () => Promise<void>;
	parentRef: React.RefObject<HTMLDivElement>;
	t: (key: string) => string;
	nextPageToken: string | null;
	virtualizer: Virtualizer<HTMLDivElement, Element>;
	loading?: boolean;
}
