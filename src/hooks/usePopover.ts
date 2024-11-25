import { useMemo, useRef, useState } from "react";

import {
	autoUpdate,
	flip,
	offset,
	safePolygon,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useHover,
	useInteractions,
	useListNavigation,
	useRole,
	useTransitionStyles,
} from "@floating-ui/react";

import { PopoverOptions } from "@src/interfaces/components";

const useBasePopover = (
	{ animation, initialOpen = false, placement = "bottom" }: PopoverOptions = {
		interactionType: "hover",
	}
) => {
	const [open, setOpen] = useState(initialOpen);

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

	return {
		open,
		setOpen,
		data,
		context,
		isMounted,
		styles,
	};
};

export const usePopover = (options: PopoverOptions = { interactionType: "hover" }) => {
	const { context, data, isMounted, open, setOpen, styles } = useBasePopover(options);

	const dismiss = useDismiss(context);
	const role = useRole(context);
	const hover = useHover(context, {
		handleClose: safePolygon({
			buffer: 100,
		}),
	});
	const click = useClick(context);

	const interactions = useInteractions([dismiss, role, hover, click]);

	return useMemo(
		() => ({
			open,
			setOpen,
			...interactions,
			...data,
			isMounted,
			styles,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[open, interactions, data, isMounted, styles]
	);
};

export const usePopoverList = (options: PopoverOptions = { interactionType: "hover" }) => {
	const { context, data, isMounted, open, setOpen, styles } = useBasePopover(options);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const listRef = useRef<(HTMLElement | null)[]>([]);

	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		onNavigate: setActiveIndex,
	});

	const dismiss = useDismiss(context);
	const role = useRole(context);

	const interactionHooks = {
		click: useClick(context, {
			enabled: options.interactionType === "click",
		}),
		hover: useHover(context, {
			enabled: options.interactionType === "hover",
			handleClose: safePolygon({ buffer: 100 }),
		}),
	};

	const interactions = useInteractions([interactionHooks[options.interactionType], dismiss, role, listNavigation]);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[open, interactions, data, isMounted, styles, activeIndex, setActiveIndex, listRef]
	);
};
