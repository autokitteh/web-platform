import { useState, useEffect } from "react";
import { ResizeHook } from "@interfaces/hooks";

export const useResize = ({ min, max, direction, initial }: ResizeHook) => {
	const initialValue = initial ? Math.min(max, Math.max(min, initial)) : max;
	const [value, setValue] = useState(initialValue);

	const onMouseDown = (event: MouseEvent) => {
		if (!(event.target instanceof HTMLElement) || !event.target.classList.contains(`resize-handle-${direction}`))
			return;

		const startCoordinate = direction === "horizontal" ? event.clientX : event.clientY;
		const dimension = direction === "horizontal" ? window.innerWidth : window.innerHeight;

		const onMouseMove = (moveEvent: MouseEvent) => {
			const currentCoordinate = direction === "horizontal" ? moveEvent.clientX : moveEvent.clientY;
			const delta =
				direction === "horizontal" ? currentCoordinate - startCoordinate : startCoordinate - currentCoordinate;
			const newValue = (delta / dimension) * 100 + value;

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
	}, [value]);

	return [value, setValue];
};
