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
	initialOpen = false,
	interactionType = "hover",
	modal,
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
	const { isMounted, styles } = useTransitionStyles(context, {
		duration: 700,
		open: { opacity: 1, left: 0, transition: "opacity 0.6s left 0.6s" },
		initial: {
			opacity: 0,
			left: "-212px",
		},
		close: {
			opacity: 0,
			transition: "opacity 0.6s left 0.6s",
			left: "-212px",
		},
	});

	const interactionHooks = {
		click: useClick(context, {
			enabled: interactionType === "click",
		}),
		hover: useHover(context, {
			enabled: interactionType === "hover",
			handleClose: safePolygon({ buffer: -Infinity }),
		}),
	};

	const interactions = useInteractions([interactionHooks[interactionType], dismiss, role]);

	return useMemo(
		() => ({
			open,
			setOpen,
			...interactions,
			...data,
			modal,
			labelId,
			descriptionId,
			setLabelId,
			setDescriptionId,
			isMounted,
			styles,
		}),
		[open, interactions, data, modal, labelId, descriptionId, isMounted, styles]
	);
}
