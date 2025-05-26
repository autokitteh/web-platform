import React, { useEffect, useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebouncedCallback } from "use-debounce";

import { AutoSizer } from "@components/atoms";

type VirtualListWrapperProps<T> = {
	className?: string;
	estimateSize: () => number;
	isLoading?: boolean;
	items: T[];
	loadMore?: () => void;
	nextPageToken?: string | null;
	rowRenderer: (item: T, index: number, measure: () => void) => React.ReactNode;
};

type RowProps<T> = {
	index: number;
	item: T;
	measure: () => void;
	rowRenderer: VirtualListWrapperProps<T>["rowRenderer"];
};

const VirtualRow = <T,>({ item, index, measure, rowRenderer }: RowProps<T>) => {
	return <>{rowRenderer(item, index, measure)}</>;
};

export const VirtualListWrapper = <T,>({
	items,
	estimateSize,
	rowRenderer,
	className,
	loadMore,
	nextPageToken,
	isLoading = false,
}: VirtualListWrapperProps<T>) => {
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: items.length + (isLoading ? 1 : 0), // 1 extra row for spinner
		getScrollElement: () => parentRef.current,
		estimateSize,
		overscan: 10,
	});

	const debouncedLoadMore = useDebouncedCallback(() => {
		loadMore?.();
	}, 300);

	useEffect(() => {
		const el = parentRef.current;
		if (!el || !loadMore || !nextPageToken) return;

		const onScroll = () => {
			const scrollBottom = el.scrollTop + el.clientHeight;
			if (scrollBottom >= el.scrollHeight - 200) {
				debouncedLoadMore();
			}
		};

		el.addEventListener("scroll", onScroll);
		return () => {
			el.removeEventListener("scroll", onScroll);
			debouncedLoadMore.cancel();
		};
	}, [loadMore, nextPageToken, debouncedLoadMore]);

	return (
		<AutoSizer>
			{({ height, width }) => (
				<div className={className} ref={parentRef} style={{ height, width, overflow: "auto" }}>
					<div
						style={{
							height: virtualizer.getTotalSize(),
							position: "relative",
							width: "100%",
						}}
					>
						{virtualizer.getVirtualItems().map((row) => {
							const item = row.index < items.length ? items[row.index] : undefined;
							const measure = (el?: HTMLElement | null) => {
								if (el) {
									virtualizer.measureElement(el);
								}
							};

							const measuredRef = (el: HTMLElement | null) => {
								measure(el);
							};

							return (
								<div
									data-index={row.index}
									key={row.key}
									ref={measuredRef}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										transform: `translateY(${row.start}px)`,
									}}
								>
									{item ? (
										<VirtualRow
											index={row.index}
											item={item}
											measure={() => measure()}
											rowRenderer={rowRenderer}
										/>
									) : (
										<div className="py-2 text-center text-gray-500">Loading...</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</AutoSizer>
	);
};
