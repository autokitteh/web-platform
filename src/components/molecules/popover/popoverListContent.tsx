import React, { useEffect, useRef, useState } from "react";

import { usePopoverListContext } from "@contexts/usePopover";
import { PopoverListItem, PopoverTriggerProps } from "@src/interfaces/components/popover.interface";
import { cn } from "@src/utilities";

import { PopoverCloseButton, PopoverContentBase } from "@components/molecules/popover";
import { useMergeRefsCustom } from "@components/molecules/popover/utilities/mergeRefs";

export const PopoverListContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLProps<HTMLDivElement> & {
		className?: string;
		itemClassName?: string;
		items: PopoverListItem[];
		onItemSelect?: (item: PopoverListItem) => void;
	}
>(function PopoverListContent({ itemClassName, items, onItemSelect, style, ...props }, propRef) {
	const { context: floatingContext, ...context } = usePopoverListContext();
	const listRef = useRef<(HTMLElement | null)[]>([]);
	const ref = useMergeRefsCustom(context.refs.setFloating, propRef);
	const [activeId, setActiveId] = useState("");

	useEffect(() => {
		if (listRef.current) {
			context.listRef.current = listRef.current;
		}
	}, [context.listRef]);

	const handleItemClick = (item: PopoverListItem, index: number, id: string) => {
		onItemSelect?.(item);
		setActiveId(id);
		context.setActiveIndex(index);
		context.setOpen(false);
	};

	const onKeyDown = (event: React.KeyboardEvent, item: PopoverListItem, index: number) => {
		if (event.key === "Enter" || event.key === " ") {
			handleItemClick(item, index, item.id);
		} else if (event.key === "ArrowDown") {
			context.setActiveIndex(Math.min(index + 1, items.length - 1));
		} else if (event.key === "ArrowUp") {
			context.setActiveIndex(Math.max(index - 1, 0));
		}
	};

	return (
		<PopoverContentBase style={style} {...props} ref={ref}>
			{items.map((item, index) => (
				<div
					aria-selected={context.activeIndex === index}
					className={cn(itemClassName, {
						"bg-gray-1100 text-white hover:bg-gray-1100": item.id === activeId,
					})}
					key={item.id}
					onClick={() => handleItemClick(item, index, item.id)}
					onKeyDown={(event) => onKeyDown(event, item, index)}
					ref={(node) => {
						if (node) listRef.current[index] = node;
					}}
					role="option"
					style={{
						cursor: "pointer",
					}}
					tabIndex={context.activeIndex === index ? 0 : -1}
				>
					{item.label}
				</div>
			))}
		</PopoverContentBase>
	);
});

export const PopoverListTrigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopoverTriggerProps>(
	function PopoverListTrigger({ children, ...props }, propRef) {
		const context = usePopoverListContext();
		const childrenRef = React.isValidElement(children) ? (children as any).ref : null;
		const ref = useMergeRefsCustom(context.refs.setReference, propRef, childrenRef);

		return (
			<button
				data-state={context.open ? "open" : "closed"}
				ref={ref}
				type="button"
				{...context.getReferenceProps(props)}
			>
				{children}
			</button>
		);
	}
);

export const PopoverListClose = PopoverCloseButton;
