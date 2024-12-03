import React from "react";

import { usePopoverContext, usePopoverListContext } from "@contexts";

export const PopoverCloseButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
	function PopoverCloseButton(props, ref) {
		const popoverContext = usePopoverContext();
		const popoverListContext = usePopoverListContext();
		const setOpen = popoverContext?.setOpen || popoverListContext?.setOpen;

		return (
			<button
				ref={ref}
				type="button"
				{...props}
				onClick={(event) => {
					props.onClick?.(event);
					setOpen?.(false);
				}}
			/>
		);
	}
);
