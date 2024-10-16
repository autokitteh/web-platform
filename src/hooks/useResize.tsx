import { useEffect, useState } from "react";

import { ResizeHook } from "@interfaces/hooks";

export const useResize = ({ direction, id, initial, max, min }: ResizeHook) => {
	const initialValue = initial > -1 ? Math.min(max, Math.max(min, initial)) : max;
	const [value, setValue] = useState(initialValue);

	const onMouseDown = (event: MouseEvent) => {
		if (!(event.target instanceof HTMLElement) || event.target.getAttribute(`data-resize-id`) !== id) {
			return;
		}

		const startCoordinate = direction === "horizontal" ? event.clientX : event.clientY;
		const dimension = direction === "horizontal" ? window.innerWidth : window.innerHeight;

		const onMouseMove = (moveEvent: MouseEvent) => {
			const currentCoordinate = direction === "horizontal" ? moveEvent.clientX : moveEvent.clientY;
			const delta =
				direction === "horizontal" ? currentCoordinate - startCoordinate : startCoordinate - currentCoordinate;
			const newValue = (delta / dimension) * 100 + value;

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

			setValue(Math.max(min, Math.min(max, newValue)));
		};

		const onMouseUp = () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
	};

	useEffect(() => {
		document.addEventListener("mousedown", onMouseDown);

		return () => {
			document.removeEventListener("mousedown", onMouseDown);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, id, direction, max, min]);

	return [value, setValue] as const;
};
