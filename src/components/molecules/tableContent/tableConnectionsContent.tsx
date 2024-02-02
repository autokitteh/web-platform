import React from "react";
import ArrowDown from "@assets/icons/SmallArrowDown.svg?react";
import TestS from "@assets/icons/TestS.svg?react";
import ThreeDots from "@assets/icons/ThreeDots.svg?react";
import { Table, THead, TBody, TR, TH, TD, IconButton, Button } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { cn } from "@utils";

interface IConnectionsContent {
	className?: string;
}

export const TableConnectionsContent = ({ className }: IConnectionsContent) => {
	const baseStyle = cn(className);

	return (
		<div className={baseStyle}>
			<div className="flex items-center justify-between text-gray-300">
				<p>Available connections</p>
				<p className="capitalize text-sm font-semibold cursor-pointer">add new</p>
			</div>
			<Table className="mt-5">
				<THead>
					<TR>
						<TH className="relative">
							Name
							<ArrowDown className="w-2 h-1.5 cursor-pointer" />
							<DropdownButton className="ml-auto" color="white" fontWeight={600} iconLeft={ThreeDots}>
								<div className="grid gap-2">
									<Button className="px-4 py-1.5" color="white" fontWeight={600} href="#" variant="transparent">
										Documentation
									</Button>
								</div>
							</DropdownButton>
						</TH>
						<TH>App</TH>
						<TH>User</TH>
						<TH>Last tested</TH>
					</TR>
				</THead>
				<TBody>
					<TR>
						<TD>Name</TD>
						<TD>App</TD>
						<TD>User</TD>
						<TD className="relative">
							Last tested
							<IconButton className="w-6 h-6 p-1 ml-auto" icon={TestS} />
							<DropdownButton className="ml-auto" color="white" fontWeight={600} iconLeft={ThreeDots} placement="left">
								<div className="grid gap-2">
									<Button className="px-4 py-1.5" color="white" fontWeight={600} href="#" variant="transparent">
										Documentation
									</Button>
								</div>
							</DropdownButton>
						</TD>
					</TR>
				</TBody>
			</Table>
		</div>
	);
};
