import React, { forwardRef, isValidElement } from "react";

import { useMergeRefs } from "@floating-ui/react";

import { usePopoverContext } from "@contexts";
import { PopoverTriggerProps } from "@src/interfaces/components";

export const PopoverTrigger = forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopoverTriggerProps>(
	function PopoverTrigger({ children, asChild, ...props }, propRef) {
		const context = usePopoverContext();
		const childrenRef = isValidElement(children) ? (children as any).ref : null;
		const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef].filter(Boolean));

		const handleClick = () => {
			context.setOpen(!context.open);
		};

		if (asChild && isValidElement(children)) {
			return React.cloneElement(children, {
				...context.getReferenceProps(props),
				ref,
				onClick: handleClick,
				"data-state": context.open ? "open" : "closed",
			});
		}

		return (
			<button
				data-state={context.open ? "open" : "closed"}
				onClick={handleClick}
				ref={ref}
				type="button"
				{...context.getReferenceProps(props)}
			>
				{children}
			</button>
		);
	}
);
