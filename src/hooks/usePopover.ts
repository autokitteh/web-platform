import { useMemo, useState } from "react";

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
	useRole,
	useTransitionStyles,
} from "@floating-ui/react";

import { PopoverOptions } from "@src/interfaces/components";

export function usePopover({
	animation,
	initialOpen = false,
	interactionType = "hover",
	placement = "bottom",
}: PopoverOptions = {}) {
	const [open, setOpen] = useState(initialOpen);
	const [labelId, setLabelId] = useState<string>();
	const [descriptionId, setDescriptionId] = useState<string>();

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

	const dismiss = useDismiss(context);
	const role = useRole(context);

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

	const interactionHooks = {
		click: useClick(context, {
			enabled: interactionType === "click",
		}),
		hover: useHover(context, {
			enabled: interactionType === "hover",
			handleClose: safePolygon({ buffer: 100 }),
		}),
	};

	const interactions = useInteractions([interactionHooks[interactionType], dismiss, role]);

	return useMemo(
		() => ({
			open,
			setOpen,
			...interactions,
			...data,
			labelId,
			descriptionId,
			setLabelId,
			setDescriptionId,
			isMounted,
			styles,
		}),
		[open, interactions, data, labelId, descriptionId, isMounted, styles]
	);
}
