import { useCallback, useEffect, useState } from "react";

import { ResizeHook } from "@interfaces/hooks";

export const useResize = ({ direction, id, initial, max, min, onChange, value: controlledValue }: ResizeHook) => {
	const initialValue = initial !== undefined ? Math.min(max, Math.max(min, initial)) : max;

	const [localValue, setLocalValue] = useState(initialValue);

	const setValue = useCallback(
		(val: number) => {
			const clamped = Math.max(min, Math.min(max, val));
			onChange?.(clamped);
			if (controlledValue === undefined) setLocalValue(clamped);
		},
		[min, max, onChange, controlledValue]
	);

	const actualValue = controlledValue === undefined ? localValue : controlledValue;

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

				const newValue = (delta / dimension) * 100 + actualValue;

				if (direction === "vertical") {
					if (newValue > 94) {
						setValue(100);

						return;
					} else if (newValue > 91) {
						setValue(91);

						return;
					} else if (newValue < 5) {
						setValue(0);

						return;
					} else if (newValue < 10) {
						setValue(10);

						return;
					}
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

		return () => {
			document.removeEventListener("mousedown", onMouseDown);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [actualValue, id, direction, max, min]);

	return [actualValue, setValue] as const;
};
