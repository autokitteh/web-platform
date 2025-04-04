import { useCallback, useEffect, useRef, useState } from "react";

import { ResizeHook } from "@interfaces/hooks";

export const useResize = ({ direction, id, initial, max, min, onChange, value: controlledValue }: ResizeHook) => {
	const initialValue = initial !== undefined ? Math.min(max, Math.max(min, initial)) : max;
	const [localValue, setLocalValue] = useState(initialValue);
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
		setLocalValue(initialValue);
	}, [initialValue]);

	useEffect(() => {
		const onMouseDown = (event: MouseEvent) => {
			if (!(event.target instanceof HTMLElement) || event.target.dataset.resizeId !== id) {
				return;
			}

			const startCoordinate = direction === "horizontal" ? event.clientX : event.clientY;
			const dimension = direction === "horizontal" ? window.innerWidth : window.innerHeight;

			const onMouseMove = (moveEvent: MouseEvent) => {
				const currentCoordinate = direction === "horizontal" ? moveEvent.clientX : moveEvent.clientY;

				const delta =
					direction === "horizontal"
						? currentCoordinate - startCoordinate
						: startCoordinate - currentCoordinate;

				let newValue = (delta / dimension) * 100 + actualValue;

				if (direction === "vertical") {
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
	}, [actualValue, id, direction, setValue]);

	return [actualValue, setValue] as const;
};
