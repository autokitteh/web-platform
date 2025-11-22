import React, { forwardRef } from "react";

import { usePopoverListContext } from "@contexts";
import { PopoverTriggerProps } from "@src/interfaces/components";

import { useMergeRefsCustom } from "@components/molecules/popover/utilities";

export const PopoverListTrigger = forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopoverTriggerProps>(
	function PopoverListTrigger({ children, className, ...props }, propRef) {
		const context = usePopoverListContext();
		const ref = useMergeRefsCustom(context.refs.setReference, propRef);
		const onKeyDown = (event: React.KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") {
				context.setOpen(!context.open);
				event.stopPropagation();
				event.preventDefault();
			}
		};

		return (
			<button
				className={className}
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

PopoverListTrigger.displayName = "PopoverListTrigger";
