import React, { useState } from "react";
import ArrowDown from "@assets/icons/ArrowDown.svg?react";
import ArrowUp from "@assets/icons/ArrowUp.svg?react";
import Info from "@assets/icons/Info.svg?react";
import SmallArrowDown from "@assets/icons/SmallArrowDown.svg?react";
import TestS from "@assets/icons/TestS.svg?react";
import ThreeDots from "@assets/icons/ThreeDots.svg?react";
import { Table, THead, TBody, Tr, Th, Td, IconButton, Button, DropdownMenu } from "@components/atoms";
import { cn } from "@utils";

interface IConnectionsContent {
	className?: string;
}

export const TableConnectionsContent = ({ className }: IConnectionsContent) => {
	const baseStyle = cn(className);
	const [isDropdownOpen, setDropdownOpen] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

	const handleHoverIcon = (event: React.MouseEvent<HTMLButtonElement>) => {
		const { top, left, height } = event.currentTarget.getBoundingClientRect();
		setDropdownPosition({ top: top + height, left });
		setDropdownOpen(true);
	};

	const handleHoverMenu = () => setDropdownOpen(true);
	const handleLeaveDropdown = () => setDropdownOpen(false);

	return (
		<div className={baseStyle}>
			<div className="flex items-center justify-between text-gray-300">
				<p className="text-base">Available connections</p>
				<p className="capitalize font-semibold cursor-pointer">add new</p>
			</div>
			<Table className="mt-5">
				<THead>
					<Tr className="group">
						<Th className="border-r-0">
							Name
							<IconButton className="w-auto p-1 hover:bg-gray-700" icon={<SmallArrowDown className="w-2 h-1.5" />} />
						</Th>
						<Th className="max-w-8 p-0">
							<IconButton
								className="w-6 h-6 p-1 hover:bg-gray-700"
								icon={<ThreeDots className="w-full h-full transition fill-gray-500 group-hover:fill-white" />}
								onMouseEnter={handleHoverIcon}
								onMouseLeave={handleLeaveDropdown}
							/>
						</Th>
						<Th>App</Th>
						<Th>User</Th>
						<Th className="border-r-0">Last tested</Th>
						<Th className="max-w-10 border-0 p-0" />
						<Th className="max-w-10 border-0 p-0" />
					</Tr>
				</THead>
				<TBody>
					<Tr className="group">
						<Td className="font-semibold border-r-0">JeffOnSlack</Td>
						<Td className="p-0 max-w-8">
							<IconButton
								className="w-6 h-6 p-1"
								icon={<Info className="w-4 h-4 transition fill-gray-500 group-hover:fill-white" />}
								onMouseEnter={handleHoverIcon}
								onMouseLeave={handleLeaveDropdown}
								variant="transparent"
							/>
						</Td>
						<Td>Slack</Td>
						<Td>Jeff@autokitteh.</Td>
						<Td className="relative text-xs border-r-0">2 days ago</Td>
						<Td className="max-w-10 border-0 p-0">
							<IconButton
								className="w-6 h-6 p-1 hover:bg-gray-700"
								icon={<TestS className="w-4 h-4 transition fill-gray-500 group-hover:fill-white" />}
							/>
						</Td>
						<Td className="max-w-10 border-0 pr-1 justify-end">
							<IconButton
								className="w-6 h-6 p-1  hover:bg-gray-700"
								icon={<ThreeDots className="w-full h-full transition fill-gray-500 group-hover:fill-white" />}
								onMouseEnter={handleHoverIcon}
								onMouseLeave={handleLeaveDropdown}
							/>
						</Td>
					</Tr>
				</TBody>
			</Table>
			<DropdownMenu
				className="grid gap-1"
				isOpen={isDropdownOpen}
				onMouseEnter={handleHoverMenu}
				onMouseLeave={handleLeaveDropdown}
				style={{
					top: `${dropdownPosition.top}px`,
					left: `${dropdownPosition.left}px`,
				}}
			>
				<Button className="px-4 py-1.5 hover:bg-gray-700 rounded-md" color="white" href="#">
					<ArrowUp /> Sort ascending
				</Button>
				<Button className="px-4 py-1.5 hover:bg-gray-700 rounded-md" color="white" href="#">
					<ArrowDown />
					Sort descending
				</Button>
				<Button className="px-4 py-1.5 hover:bg-gray-700 rounded-md" color="white" href="#">
					Delete
				</Button>
			</DropdownMenu>
		</div>
	);
};
