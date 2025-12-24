import { useCallback, useRef, useState } from "react";

import { List } from "react-virtualized";

export interface ScrollPosition {
	scrollOffset: number;
	scrollHeight: number;
	clientHeight: number;
}

export interface UseScrollPositionOptions {
	topThreshold?: number;
	bottomThreshold?: number;
	debounceMs?: number;
}

export interface ScrollAnchor {
	itemId: string;
	offsetFromTop: number;
}

export interface UseScrollPositionReturn {
	isAtTop: boolean;
	isAtBottom: boolean;
	scrollPosition: ScrollPosition;
	captureAnchor: (itemId: string, itemIndex: number, rowHeight: number) => ScrollAnchor | null;
	restoreAnchor: (
		anchor: ScrollAnchor,
		findItemIndex: (itemId: string) => number,
		rowHeight: number,
		listRef: React.RefObject<List | null>
	) => void;
	handleScroll: (params: { clientHeight: number; scrollHeight: number; scrollTop: number }) => void;
	lastScrollTime: number;
}

const DEFAULT_TOP_THRESHOLD = 48;
const DEFAULT_BOTTOM_THRESHOLD = 96;

export function useScrollPosition({
	topThreshold = DEFAULT_TOP_THRESHOLD,
	bottomThreshold = DEFAULT_BOTTOM_THRESHOLD,
}: UseScrollPositionOptions = {}): UseScrollPositionReturn {
	const [isAtTop, setIsAtTop] = useState(true);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
		scrollOffset: 0,
		scrollHeight: 0,
		clientHeight: 0,
	});
	const lastScrollTimeRef = useRef(Date.now());

	const handleScroll = useCallback(
		({
			scrollTop,
			scrollHeight,
			clientHeight,
		}: {
			clientHeight: number;
			scrollHeight: number;
			scrollTop: number;
		}) => {
			lastScrollTimeRef.current = Date.now();

			const distanceFromTop = scrollTop;
			const distanceFromBottom = scrollHeight - clientHeight - scrollTop;

			setIsAtTop(distanceFromTop <= topThreshold);
			setIsAtBottom(distanceFromBottom <= bottomThreshold);
			setScrollPosition({
				scrollOffset: scrollTop,
				scrollHeight,
				clientHeight,
			});
		},
		[topThreshold, bottomThreshold]
	);

	const captureAnchor = useCallback(
		(itemId: string, itemIndex: number, rowHeight: number): ScrollAnchor | null => {
			const offsetFromTop = scrollPosition.scrollOffset - itemIndex * rowHeight;

			return {
				itemId,
				offsetFromTop,
			};
		},
		[scrollPosition.scrollOffset]
	);

	const restoreAnchor = useCallback(
		(
			anchor: ScrollAnchor,
			findItemIndex: (itemId: string) => number,
			rowHeight: number,
			listRef: React.RefObject<List | null>
		) => {
			const newIndex = findItemIndex(anchor.itemId);
			if (newIndex === -1 || !listRef.current) return;

			const targetScrollOffset = newIndex * rowHeight + anchor.offsetFromTop;
			listRef.current.scrollToPosition(Math.max(0, targetScrollOffset));
		},
		[]
	);

	return {
		isAtTop,
		isAtBottom,
		scrollPosition,
		captureAnchor,
		restoreAnchor,
		handleScroll,
		lastScrollTime: lastScrollTimeRef.current,
	};
}
