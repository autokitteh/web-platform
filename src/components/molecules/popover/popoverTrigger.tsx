import React, { forwardRef, isValidElement } from "react";

import { useMergeRefs } from "@floating-ui/react";

import { usePopoverContext } from "@contexts";
import { PopoverTriggerProps } from "@src/interfaces/components";

export const PopoverTrigger = forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopoverTriggerProps>(
	function PopoverTrigger({ children, asChild, title, ...props }, propRef) {
		const context = usePopoverContext();
		const childrenRef = isValidElement(children) ? (children as any).ref : null;
		const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef].filter(Boolean));
		const ariaLabelProps = title ? { "aria-label": title } : {};

		const handleClick = () => {
			context.setOpen(!context.open);
		};

		if (asChild && isValidElement(children)) {
			// Only add manual click handler for click interactions, let floating-ui handle hover
			const manualClickProps = context.interactionType === "click" ? { onClick: handleClick } : {};

			return React.cloneElement(children as React.ReactElement<any>, {
				...context.getReferenceProps({ ...ariaLabelProps, ...props }),
				ref,
				...manualClickProps,
				"data-state": context.open ? "open" : "closed",
			});
		}

		return (
			<button
				data-state={context.open ? "open" : "closed"}
				onClick={handleClick}
				ref={ref}
				title={title || ""}
				type="button"
				{...context.getReferenceProps({ ...ariaLabelProps, ...props })}
			>
				{children}
			</button>
		);
	}
);
