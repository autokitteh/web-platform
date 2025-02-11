import React, { useEffect, useRef, useState } from "react";

import { PopoverContentBase } from "./popoverContentBase";
import { usePopoverListContext } from "@contexts/usePopover";
import { PopoverListItem } from "@src/interfaces/components/popover.interface";
import { cn } from "@src/utilities";

import { SearchInput } from "@components/atoms";
import { useMergeRefsCustom } from "@components/molecules/popover/utilities";

export const PopoverListContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLProps<HTMLDivElement> & {
		activeId?: string;
		className?: string;
		displaySearch?: boolean;
		emptyListMessage?: string;
		itemClassName?: string;
		items: PopoverListItem[];
		maxItemsToShow?: number;
		onItemSelect?: (item: PopoverListItem) => void;
	}
>(function PopoverListContent(
	{ activeId, emptyListMessage, itemClassName, items, onItemSelect, style, maxItemsToShow, displaySearch, ...props },
	propRef
) {
	const { context: floatingContext, ...context } = usePopoverListContext();
	const listRef = useRef<(HTMLElement | null)[]>([]);
	const ref = useMergeRefsCustom(context.refs.setFloating, propRef);
	const firstItemRef = useRef<HTMLDivElement | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	const [popoverItems, setPopoverItems] = useState<PopoverListItem[]>(items);

	useEffect(() => {
		setPopoverItems(items);
	}, [items]);

	useEffect(() => {
		if (listRef.current) {
			context.listRef.current = listRef.current;
		}
	}, [context.listRef]);

	const handleItemClick = (item: PopoverListItem, index: number) => {
		onItemSelect?.(item);
		context.setActiveIndex(index);
		context.setOpen(false);
	};

	const onKeyDown = (event: React.KeyboardEvent, item: PopoverListItem, index: number) => {
		if (event.key === "Enter" || event.key === " ") {
			handleItemClick(item, index);
		}
		if (event.key === "ArrowDown" || event.key === "Tab") {
			context.setActiveIndex(Math.min(index + 1, items.length - 1));
		}
		if (event.key === "ArrowUp" || (event.shiftKey && event.key === "Tab")) {
			context.setActiveIndex(Math.max(index - 1, 0));
		}
	};

	const filterItemsBySearchTerm = (event: React.ChangeEvent<HTMLInputElement>) => {
		const filterSearchTerm = event.target.value.toLowerCase();
		setSearchTerm(filterSearchTerm);
		if (!filterSearchTerm) {
			setPopoverItems(items);
			return;
		}
		const filteredItems = items.filter((item) => {
			if (typeof item.label === "string") return item.label.toLowerCase().includes(searchTerm);
			return item.id.toLowerCase().includes(filterSearchTerm);
		});
		setPopoverItems(filteredItems);
	};

	const popoverBaseStyle = maxItemsToShow
		? {
				...style,
				maxHeight: 36 * maxItemsToShow + (displaySearch ? 32 : 0),
				overflowY: "auto",
				marginBottom: "8px",
			}
		: style;

	const showSearchBox = displaySearch && items.length > (maxItemsToShow || 0);

	return (
		<PopoverContentBase
			style={popoverBaseStyle}
			{...props}
			context={context}
			floatingContext={floatingContext}
			initialFocusElement={firstItemRef}
			ref={ref}
		>
			<SearchInput
				className="mb-2"
				hidden={!showSearchBox}
				labelOverlayClassName="bg-gray-250"
				onChange={filterItemsBySearchTerm}
				type="text"
				value={searchTerm}
			/>
			{popoverItems.length ? (
				<div className="scrollbar max-h-full overflow-auto">
					{popoverItems.map((item, index) => (
						<div
							aria-selected={context.activeIndex === index}
							className={cn(itemClassName, {
								"bg-gray-1100 text-white hover:bg-gray-1100 cursor-pointer": item.id === activeId,
							})}
							key={item.id}
							onClick={() => handleItemClick(item, index)}
							onKeyDown={(event) => onKeyDown(event, item, index)}
							ref={(node) => {
								if (!node) return;
								listRef.current[index] = node;
								if (index === 0) {
									firstItemRef.current = node;
								}
							}}
							role="option"
							tabIndex={context.activeIndex === index ? 0 : -1}
						>
							{item.label}
						</div>
					))}
				</div>
			) : (
				<div aria-label={emptyListMessage} className={itemClassName}>
					{emptyListMessage}
				</div>
			)}
		</PopoverContentBase>
	);
});
