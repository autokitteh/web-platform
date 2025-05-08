import React, { useMemo, useState, useCallback, forwardRef, useImperativeHandle, useId } from "react";

import { defaultPopoverSelect } from "@src/constants";
import { BasePopoverSelectProps, BasePopoverSelectRef } from "@src/interfaces/components";

import { Typography } from "@components/atoms";
import { PopoverListContent, PopoverListTrigger, PopoverListWrapper } from "@components/molecules/popover";
import { LabelSelectPopoverItem } from "@components/molecules/popoverSelect";

import { ChevronDownIcon, Close } from "@assets/image/icons";

export const BasePopoverSelect = forwardRef<BasePopoverSelectRef, BasePopoverSelectProps>(
	(
		{
			label,
			items,
			emptyListMessage,
			defaultSelectedItems = [],
			onItemSelected,
			onItemsSelected,
			ariaLabel,
			multiple = false,
		},
		ref
	) => {
		const [selectedItems, setSelectedItems] = useState<string[]>(defaultSelectedItems);
		const showCloseIcon = useMemo(() => {
			return selectedItems.length > 0 && !selectedItems.includes(defaultPopoverSelect);
		}, [selectedItems]);

		const [contentWidth, setContentWidth] = useState<number | undefined>(undefined);
		const popoverId = useId();
		const [isPopoverOpen, setIsPopoverOpen] = useState(false);

		const containerCallbackRef = useCallback((node: HTMLDivElement | null) => {
			if (!node) return;
			const observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setContentWidth(entry.contentRect.width);
				}
			});
			observer.observe(node);
			return () => observer.disconnect();
		}, []);

		const handleReset = useCallback(() => {
			setSelectedItems([defaultPopoverSelect]);
			if (multiple) {
				onItemsSelected?.([defaultPopoverSelect]);

				return;
			}

			onItemSelected?.(undefined);
		}, [multiple, onItemSelected, onItemsSelected]);

		const handleResetClick = useCallback(
			(event: React.MouseEvent<SVGElement>) => {
				event.stopPropagation();
				handleReset();
			},
			[handleReset]
		);

		useImperativeHandle(ref, () => ({
			reset: handleReset,
		}));

		const handleItemSelect = useCallback(
			({ id }: { id: string }) => {
				setSelectedItems((prevSelected) => {
					if (id === defaultPopoverSelect && !prevSelected.includes(defaultPopoverSelect)) {
						if (multiple) onItemsSelected?.([defaultPopoverSelect]);
						else onItemSelected?.(defaultPopoverSelect);
						return [defaultPopoverSelect];
					}

					if (!multiple) {
						const newSelected = id === prevSelected[0] ? [defaultPopoverSelect] : [id];
						onItemSelected?.(newSelected[0]);
						return newSelected;
					}

					const isSelected = prevSelected.includes(id);
					let newSelected = prevSelected.filter((item) => item !== defaultPopoverSelect);
					newSelected = isSelected ? newSelected.filter((itemId) => itemId !== id) : [...newSelected, id];

					if (newSelected.length === 0) {
						newSelected = [defaultPopoverSelect];
					}
					onItemsSelected?.(newSelected);
					return newSelected;
				});
			},
			[multiple, onItemSelected, onItemsSelected]
		);

		useImperativeHandle(ref, () => ({
			reset: handleReset,
		}));

		const selectedLabel = useMemo(() => {
			return selectedItems.map((id) => items.find((item) => item.id === id)?.label || id).join(", ");
		}, [selectedItems, items]);

		const allItems = useMemo(
			() => [
				{
					id: defaultPopoverSelect,
					label: (
						<LabelSelectPopoverItem
							isActiveItem={selectedItems.includes(defaultPopoverSelect)}
							name="All"
							showCheckbox={false}
						/>
					),
				},
				...items.map((item) => ({
					...item,
					label: (
						<LabelSelectPopoverItem
							count={item.count}
							icon={item.icon}
							isActiveItem={selectedItems.includes(item.id)}
							name={item.label}
							showCheckbox={multiple}
						/>
					),
				})),
			],
			[items, selectedItems, multiple]
		);

		return (
			<div aria-controls={popoverId} aria-expanded={isPopoverOpen} ref={containerCallbackRef} role="combobox">
				<Typography className="mb-1 select-none text-xs text-gray-500">{label}</Typography>
				<PopoverListWrapper animation="slideFromBottom" interactionType="click" onOpenChange={setIsPopoverOpen}>
					<PopoverListTrigger
						aria-label={ariaLabel || label}
						className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-750 px-2.5"
					>
						<div className="select-none truncate text-base text-white">{selectedLabel}</div>
						<div className="shrink-0">
							{showCloseIcon ? (
								<Close
									className="size-4 cursor-pointer fill-gray-750 hover:fill-white"
									onClick={handleResetClick}
								/>
							) : (
								<ChevronDownIcon className="pointer-events-none size-4 fill-gray-750" />
							)}
						</div>
					</PopoverListTrigger>
					<PopoverListContent
						className="z-40 flex w-full flex-col gap-0.5 rounded-lg border border-gray-750 bg-white p-1 pt-1.5 text-black"
						closeOnSelect={!multiple}
						displaySearch={items.length > 6}
						emptyListMessage={emptyListMessage}
						id={popoverId}
						itemClassName="cursor-pointer"
						items={allItems}
						maxItemsToShow={6}
						onItemSelect={handleItemSelect}
						style={{ width: contentWidth }}
					/>
				</PopoverListWrapper>
			</div>
		);
	}
);

BasePopoverSelect.displayName = "BasePopoverSelect";
