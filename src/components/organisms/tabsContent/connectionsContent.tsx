import React, { useState } from "react";
import { PlusCircle, ThreeDots, Info, TestS } from "@assets/image";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, DropdownMenu } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { connectionsData } from "@constants/lists";
import { ESortDirection } from "@enums/components";
import { IConnectionsContent, ITabConnection } from "@interfaces/components";
import { TSortDirection } from "@type/components";
import { cn } from "@utilities";
import { orderBy } from "lodash";
import moment from "moment";

export const ConnectionsContent = ({ className }: IConnectionsContent) => {
	const [sort, setSort] = useState<{
		direction: TSortDirection | undefined;
		column: Exclude<keyof ITabConnection, "id"> | undefined;
	}>({ direction: undefined, column: undefined });
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
	const [isDropdownOpen, setDropdownOpen] = useState(false);
	const [connections, setConnections] = useState(connectionsData);

	const baseStyle = cn("pt-14", className);

	const handleHoverIcon = (event: React.MouseEvent<HTMLButtonElement>) => {
		const { top, left, height } = event.currentTarget.getBoundingClientRect();
		setDropdownPosition({ top: top + height, left });
		setDropdownOpen(true);
	};

	const handleHoverMenu = () => setDropdownOpen(true);
	const handleLeaveDropdown = () => setDropdownOpen(false);

	const toggleSortConnections = (key: Exclude<keyof ITabConnection, "id">) => {
		const newDirection =
			sort.column === key && sort.direction === ESortDirection.ASC ? ESortDirection.DESC : ESortDirection.ASC;

		const sortedConnections = orderBy(connections, [key], [newDirection]);
		setSort({ direction: newDirection, column: key });
		setConnections(sortedConnections);
	};

	return (
		<div className={baseStyle}>
			<div className="flex items-center justify-between text-gray-300">
				<p className="text-base">Available connections</p>
				<p className="capitalize font-semibold cursor-pointer group hover:text-white flex items-center gap-1">
					<PlusCircle className="transtion stroke-gray-300 group-hover:stroke-white w-5 h-5" />
					add new
				</p>
			</div>
			<Table className="mt-5">
				<THead>
					<Tr className="group">
						<Th className="border-r-0">
							Name
							<SortButton
								isActive={"name" === sort.column}
								onClick={() => toggleSortConnections("name")}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="max-w-8 p-0" />
						<Th>
							App
							<SortButton
								isActive={"platform" === sort.column}
								onClick={() => toggleSortConnections("platform")}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th>
							User
							<SortButton
								isActive={"user" === sort.column}
								onClick={() => toggleSortConnections("user")}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="border-r-0 pr-6">
							Last tested
							<SortButton
								isActive={"lastTested" === sort.column}
								onClick={() => toggleSortConnections("lastTested")}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="max-w-10 border-0 p-0" />
						<Th className="max-w-10 border-0 p-0" />
					</Tr>
				</THead>
				<TBody>
					{connections.map(({ name, platform, user, lastTested, id }) => (
						<Tr className="group" key={id}>
							<Td className="font-semibold border-r-0">{name}</Td>
							<Td className="p-0 max-w-8">
								<IconButton
									className="w-6 h-6 p-1 hover:bg-transparent"
									onMouseEnter={handleHoverIcon}
									onMouseLeave={handleLeaveDropdown}
								>
									<Info className="w-4 h-4 transition fill-gray-500 group-hover:fill-white" />
								</IconButton>
							</Td>
							<Td>{platform}</Td>
							<Td>{user}</Td>
							<Td className="text-xs border-r-0 pr-6">{moment(lastTested).fromNow()}</Td>
							<Td className="max-w-10 border-0 p-0">
								<IconButton className="w-6 h-6 p-1 hover:bg-gray-700">
									<TestS className="w-4 h-4 transition fill-gray-500 group-hover:fill-white" />
								</IconButton>
							</Td>
							<Td className="max-w-10 border-0 pr-1 justify-end">
								<IconButton
									className="w-6 h-6 p-1  hover:bg-gray-700"
									onMouseEnter={handleHoverIcon}
									onMouseLeave={handleLeaveDropdown}
								>
									<ThreeDots className="w-full h-full transition fill-gray-500 group-hover:fill-white" />
								</IconButton>
							</Td>
						</Tr>
					))}
				</TBody>
			</Table>
			<DropdownMenu
				className="flex flex-col gap-1 fixed"
				isOpen={isDropdownOpen}
				onMouseEnter={handleHoverMenu}
				onMouseLeave={handleLeaveDropdown}
				style={{
					top: `${dropdownPosition.top}px`,
					left: `${dropdownPosition.left}px`,
				}}
			>
				<Button className="px-4 py-1.5 hover:bg-gray-700 rounded-md text-white">Delete</Button>
			</DropdownMenu>
		</div>
	);
};
