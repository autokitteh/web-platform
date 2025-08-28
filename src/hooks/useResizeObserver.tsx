import { useEffect, useRef } from "react";

interface UseResizeObserverProps {
	callback: () => void;
	target?: Element;
}

export const useResizeObserver = ({ callback, target }: UseResizeObserverProps) => {
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	useEffect(() => {
		const targetElement = target || document.body;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === targetElement) {
					callback();
				}
			}
		});

		resizeObserver.observe(targetElement);
		resizeObserverRef.current = resizeObserver;

		return () => {
			resizeObserver.disconnect();
		};
	}, [callback, target]);

	return resizeObserverRef.current;
};
