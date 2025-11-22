import React, { forwardRef } from "react";

import { useMergeRefs } from "@floating-ui/react";

import { usePopoverContext } from "@contexts";
import { PopoverTriggerProps } from "@src/interfaces/components";

export const PopoverTrigger = forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopoverTriggerProps>(
	function PopoverTrigger({ children, title, ariaLabel, ...props }, propRef) {
		const context = usePopoverContext();
		const ref = useMergeRefs([context.refs.setReference, propRef]);
		const ariaLabelProps = ariaLabel ? { "aria-label": ariaLabel } : { "aria-label": title ?? "" };
		const titleProps = title ? { title } : {};

		const handleClick = () => {
			context.setOpen(!context.open);
		};

		const manualClickProps = context.interactionType === "click" ? { onClick: handleClick } : {};
		const referenceProps = context.getReferenceProps({ ...ariaLabelProps, ...titleProps, ...props });

		const mergedProps = {
			...referenceProps,
			ref,
			...manualClickProps,
			"data-state": context.open ? "open" : "closed",
		};

		return React.cloneElement(children as React.ReactElement<any>, mergedProps);
	}
);

PopoverTrigger.displayName = "PopoverTrigger";
