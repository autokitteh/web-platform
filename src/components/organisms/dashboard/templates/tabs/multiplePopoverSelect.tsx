import React, { useMemo, useState } from "react";

import { PopoverListItem } from "@src/interfaces/components/popover.interface";

import { Typography } from "@components/atoms";
import { PopoverListContent, PopoverListTrigger, PopoverListWrapper } from "@components/molecules/popover";

import { ChevronDownIcon, Close } from "@assets/image/icons";

interface MultiplePopoverSelectProps {
	label: string;
	items: PopoverListItem[];
	emptyListMessage?: string;
}

export const MultiplePopoverSelect = ({ label, items, emptyListMessage }: MultiplePopoverSelectProps) => {
	const [selectedItem, setSelectedItem] = useState<string[]>([]);
	const [showCloseIcon, setShowCloseIcon] = useState(false);

	const handleItemSelect = ({ id }: { id: string }) => {
		setSelectedItem((prevSelected) =>
			prevSelected.includes(id) ? prevSelected.filter((item) => item !== id) : [...prevSelected, id]
		);
		setShowCloseIcon(true);
	};

	const handleCloseIconClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
		event.stopPropagation();
		setSelectedItem([]);
		setShowCloseIcon(false);
	};

	const selectedLabel = useMemo(() => selectedItem.join(", "), [selectedItem]);

	return (
		<div className="w-full">
			<Typography className="mb-1 text-xs text-gray-500">{label}</Typography>
			<PopoverListWrapper animation="slideFromBottom" interactionType="click">
				<PopoverListTrigger className="flex w-full max-w-96 items-center justify-between rounded-lg border border-gray-750 px-2.5 py-2">
					<div className="select-none truncate text-base text-white">{selectedLabel}</div>
					{showCloseIcon ? (
						<Close className="size-4 fill-gray-750" onClick={handleCloseIconClick} />
					) : (
						<ChevronDownIcon className="size-4 fill-gray-750" />
					)}
				</PopoverListTrigger>
				<PopoverListContent
					className="z-40 flex w-full max-w-96 flex-col gap-0.5 rounded-lg border border-gray-750 bg-white p-1 pt-1.5 text-black"
					closeOnSelect={false}
					displaySearch={items.length > 6}
					emptyListMessage={emptyListMessage}
					itemClassName="cursor-pointer"
					items={items}
					maxItemsToShow={6}
					onItemSelect={handleItemSelect}
				/>
			</PopoverListWrapper>
		</div>
	);
};
