import { useCallback, useEffect, useRef, useState } from "react";

import { ResizeHook } from "@interfaces/hooks";

interface ResizeHookWithInvert extends ResizeHook {
	invertDirection?: boolean;
}

export const useResize = (props: ResizeHookWithInvert) => {
	const {
		direction,
		id,
		initial,
		max,
		min,
		onChange,
		value: controlledValue,
		invertDirection,
	} = props;
	const [localValue, setLocalValue] = useState(initial);
	const actualValue = controlledValue === undefined ? localValue : controlledValue;

	const refId = useRef<number | null>(null);

	const setValue = useCallback(
		(val: number) => {
			const clamped = Math.max(min, Math.min(max, val));

			if (refId.current) {
				cancelAnimationFrame(refId.current);
			}

			refId.current = requestAnimationFrame(() => {
				onChange?.(clamped);
				if (controlledValue === undefined) {
					setLocalValue(clamped);
				}
			});
		},
		[min, max, onChange, controlledValue]
	);

	useEffect(() => {
		setLocalValue(initial);
	}, [initial]);

	useEffect(() => {
		const onMouseDown = (event: MouseEvent) => {
			if (!(event.target instanceof HTMLElement) || event.target.dataset.resizeId !== id) {
				return;
			}

			const startCoordinate = direction === "horizontal" ? event.clientX : event.clientY;
			const dimension = direction === "horizontal" ? window.innerWidth : window.innerHeight;

			const onMouseMove = (moveEvent: MouseEvent) => {
				const currentCoordinate = direction === "horizontal" ? moveEvent.clientX : moveEvent.clientY;

				let delta =
					direction === "horizontal"
						? currentCoordinate - startCoordinate
						: startCoordinate - currentCoordinate;
				if (invertDirection && direction === "horizontal") {
					delta = -delta;
				}

				let newValue: number;
				if (direction === "horizontal") {
					// For horizontal resizing, use pixel values directly
					newValue = actualValue + delta;
				} else {
					// For vertical, keep percentage-based calculation
					newValue = (delta / dimension) * 100 + actualValue;
					if (newValue > 94) newValue = 100;
					else if (newValue > 91) newValue = 91;
					else if (newValue < 5) newValue = 0;
					else if (newValue < 10) newValue = 10;
				}


				setValue(newValue);
			};

			const onMouseUp = () => {
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
			};

			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		};

		document.addEventListener("mousedown", onMouseDown);

		return () => document.removeEventListener("mousedown", onMouseDown);
	}, [actualValue, id, direction, setValue, invertDirection]);

	return [actualValue, setValue] as const;
};
