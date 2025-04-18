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
	arrow,
} from "@floating-ui/react";

import { PopoverOptions } from "@src/interfaces/components";

const useBasePopover = (
	{ animation, initialOpen = false, placement = "bottom", onOpenChange, middlewareConfig = {} }: PopoverOptions = {
		interactionType: "hover",
	}
) => {
	const [open, setOpen] = useState(initialOpen);
	const arrowRef = useRef<SVGSVGElement>(null);

	const middleware = [
		offset(5),
		flip({
			crossAxis: placement.includes("-"),
			fallbackAxisSideDirection: "end",
		}),
		shift(),
	];

	if (middlewareConfig?.arrow?.element) {
		middleware.push(
			arrow({
				element: middlewareConfig.arrow.element,
				padding: 5,
			})
		);
	}

	const data = useFloating({
		placement,
		open,
		onOpenChange: (isOpen) => {
			onOpenChange?.(isOpen);
			setOpen(isOpen);
		},
		whileElementsMounted: autoUpdate,
		middleware,
	});

	const close = () => setOpen(false);

	const context = data.context;

	const animationConfigurations = {
		slideFromLeft: {
			open: { opacity: 1, left: 0 },
			initial: { opacity: 0, left: "-212px" },
			close: { opacity: 0, left: "-212px" },
		},
		slideFromBottom: {
			open: { opacity: 1, top: 0 },
			initial: { opacity: 0, top: "50px" },
			close: { opacity: 0, top: "50px" },
		},
	};
	const transitionConfiguration = animation ? animationConfigurations[animation] : {};

	const { isMounted, styles } = useTransitionStyles(context, transitionConfiguration);

	return {
		open,
		setOpen,
		data,
		context,
		isMounted,
		styles,
		close,
		arrowRef,
	};
};

export const usePopover = (
	options: PopoverOptions = {
		animation: "slideFromBottom",
		allowDismiss: true,
	}
) => {
	const { close, context, data, isMounted, open, setOpen, styles, arrowRef } = useBasePopover(options);
	const { interactionType = "hover", allowDismiss } = options;

	const dismiss = useDismiss(context, { enabled: allowDismiss });

	const interactionHooks = {
		click: useClick(context, {
			enabled: interactionType === "click",
		}),
		hover: useHover(context, {
			enabled: interactionType === "hover",
			handleClose: safePolygon({ buffer: 100 }),
		}),
	};

	const interactions = useInteractions([interactionHooks[interactionType], dismiss]);

	return useMemo(
		() => ({
			open,
			setOpen,
			...interactions,
			...data,
			isMounted,
			styles,
			close,
			interactionType,
			arrowRef,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[open, interactions, data, isMounted, styles, arrowRef]
	);
};

export const usePopoverList = (
	options: PopoverOptions = { interactionType: "hover", animation: "slideFromBottom" }
) => {
	const { close, context, data, isMounted, open, setOpen, styles, arrowRef } = useBasePopover(options);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const listRef = useRef<(HTMLElement | null)[]>([]);
	const { interactionType = "click" } = options;

	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		onNavigate: setActiveIndex,
	});

	const dismiss = useDismiss(context);
	const role = useRole(context);

	const interactionHooks = {
		click: useClick(context, {
			enabled: interactionType === "click",
		}),
		hover: useHover(context, {
			enabled: interactionType === "hover",
			handleClose: safePolygon({ buffer: 100 }),
		}),
	};

	const interactions = useInteractions([interactionHooks[interactionType], dismiss, role, listNavigation]);

	return useMemo(
		() => ({
			open,
			setOpen,
			...interactions,
			...data,
			isMounted,
			styles,
			close,
			activeIndex,
			setActiveIndex,
			listRef,
			arrowRef,
			interactionType: options.interactionType,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[open, interactions, data, isMounted, styles, activeIndex, setActiveIndex, listRef, arrowRef]
	);
};
