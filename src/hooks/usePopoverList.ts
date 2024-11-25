import { useMemo, useRef, useState } from "react";

import {
	autoUpdate,
	flip,
	offset,
	safePolygon,
	shift,
	useClick,
	useFloating,
	useHover,
	useInteractions,
	useListNavigation,
	useTransitionStyles,
} from "@floating-ui/react";

import { PopoverOptions } from "@src/interfaces/components";

export const usePopoverList = ({ animation, initialOpen = false, placement = "bottom" }: PopoverOptions = {}) => {
	const [open, setOpen] = useState(initialOpen);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const listRef = useRef<(HTMLElement | null)[]>([]);

	const data = useFloating({
		placement,
		open,
		onOpenChange: setOpen,
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(5),
			flip({
				crossAxis: placement.includes("-"),
				fallbackAxisSideDirection: "end",
			}),
			shift(),
		],
	});

	const context = data.context;

	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		onNavigate: setActiveIndex,
	});

	const hover = useHover(context, {
		handleClose: safePolygon({
			buffer: 100,
		}),
	});
	const click = useClick(context);

	let transitionConfiguration = {};

	switch (animation) {
		case "slideFromLeft":
			transitionConfiguration = {
				open: { opacity: 1, left: 0 },
				initial: { opacity: 0, left: "-212px" },
				close: { opacity: 0, left: "-212px" },
			};
			break;
		case "slideFromBottom":
			transitionConfiguration = {
				open: { opacity: 1, top: 0 },
				initial: { opacity: 0, top: "50px" },
				close: { opacity: 0, top: "50px" },
			};
			break;
		case "none":
		default:
			break;
	}

	const { isMounted, styles } = useTransitionStyles(context, transitionConfiguration);

	const interactions = useInteractions([hover, click, listNavigation]);

	return useMemo(
		() => ({
			open,
			setOpen,
			...interactions,
			...data,
			isMounted,
			styles,
			activeIndex,
			setActiveIndex,
			listRef,
		}),
		[open, interactions, data, isMounted, styles, activeIndex, setActiveIndex, listRef]
	);
};
