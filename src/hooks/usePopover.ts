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
				padding: 5,
			}),
			shift({ padding: 5 }),
		],
	});

	const context = data.context;

	const dismiss = useDismiss(context);
	const role = useRole(context);

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
		}),
		[open, setOpen, interactions, data, modal, labelId, descriptionId]
	);
}
