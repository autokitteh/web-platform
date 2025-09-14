import React, { forwardRef, isValidElement } from "react";

import { usePopoverListContext } from "@contexts";
import { PopoverTriggerProps } from "@src/interfaces/components";

import { useMergeRefsCustom } from "@components/molecules/popover/utilities";

export const PopoverListTrigger = forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopoverTriggerProps>(
	function PopoverListTrigger({ children, asChild, ...props }, propRef) {
		const context = usePopoverListContext();
		const childrenRef = isValidElement(children) ? (children as any).ref : null;
		const ref = useMergeRefsCustom(context.refs.setReference, propRef, childrenRef);
		const onKeyDown = (event: React.KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") {
				context.setOpen(!context.open);
				event.stopPropagation();
				event.preventDefault();
			}
		};

		if (asChild && isValidElement(children)) {
			return React.cloneElement(children as React.ReactElement<any>, {
				...context.getReferenceProps(props),
				ref,
				onKeyDown,
				"data-state": context.open ? "open" : "closed",
			});
		}

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
