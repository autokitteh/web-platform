import { useMemo, useState } from "react";

import {
	autoUpdate,
	flip,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
} from "@floating-ui/react";

import { PopoverOptions } from "@src/interfaces/components";

export function usePopover({
	initialOpen = false,
	modal,
	onOpenChange: setControlledOpen,
	open: controlledOpen,
	placement = "bottom",
}: PopoverOptions = {}) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
	const [labelId, setLabelId] = useState<string | undefined>();
	const [descriptionId, setDescriptionId] = useState<string | undefined>();

	const open = controlledOpen ?? uncontrolledOpen;
	const setOpen = setControlledOpen ?? setUncontrolledOpen;

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

	const click = useClick(context, {
		enabled: true,
	});
	const dismiss = useDismiss(context);
	const role = useRole(context);

	const interactions = useInteractions([click, dismiss, role]);

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
