import * as React from "react";

import { usePopoverContext } from "@contexts/usePopover";
import { PopoverTriggerProps } from "@src/interfaces/components";

import { PopoverCloseButton, PopoverContentBase } from "@components/molecules/popover";
import { useMergeRefsCustom } from "@components/molecules/popover/utilities/mergeRefs";

export const PopoverTrigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopoverTriggerProps>(
	function PopoverTrigger({ children, ...props }, propRef) {
		const context = usePopoverContext();
		const childrenRef = React.isValidElement(children) ? (children as any).ref : null;
		const ref = useMergeRefsCustom(context.refs.setReference, propRef, childrenRef);

		const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
			if (event.key === "Enter" || event.key === " ") {
				context.setOpen(true);
			}
		};

		return (
			<button
				data-state={context.open ? "open" : "closed"}
				ref={ref}
				type="button"
				{...context.getReferenceProps(props)}
				onKeyDown={onKeyDown}
			>
				{children}
			</button>
		);
	}
);

export const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function PopoverContent(
	{ style, ...props },
	propRef
) {
	return <PopoverContentBase style={style} {...props} ref={propRef} />;
});

export const PopoverClose = PopoverCloseButton;
