import React, { useState } from "react";
import { PlusCircle, ThreeDots, Info, TestS } from "@assets/image";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button } from "@components/atoms";
import { SortButton, Modal, DropdownButton, TableConnectionInfo, TableConnectionAction } from "@components/molecules";
import { connectionsData } from "@constants/lists";
import { ESortDirection } from "@enums/components";
import { IConnectionsContent, ITabConnection } from "@interfaces/components";
import { TSortDirection } from "@type/components";
import { cn } from "@utilities";
import { orderBy } from "lodash";
import moment from "moment";

export const ConnectionsContent = ({ className }: IConnectionsContent) => {
	const [isModal, setIsModal] = useState(false);
	const [sort, setSort] = useState<{
		direction: TSortDirection;
		column: Exclude<keyof ITabConnection, "id">;
	}>({ direction: ESortDirection.ASC, column: "lastTested" });
	const [connections, setConnections] = useState(connectionsData);

	const baseStyle = cn("pt-14", className);

	const toggleModal = () => setIsModal(!isModal);

	const toggleSortConnections = (key: Exclude<keyof ITabConnection, "id">) => {
		const newDirection =
			sort.column === key && sort.direction === ESortDirection.ASC ? ESortDirection.DESC : ESortDirection.ASC;

		const sortedConnections = orderBy(connections, [key], [newDirection]);
		setSort({ direction: newDirection, column: key });
		setConnections(sortedConnections);
	};

	return (
		<div className={baseStyle}>
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">Available connections</div>
				<Button
					className="w-auto group gap-1 p-0 capitalize font-semibold text-gray-300 hover:text-white"
					href="/app/new-connection"
				>
					<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
					Add new
				</Button>
			</div>
			<Table className="mt-5">
				<THead>
					<Tr>
						<Th className="border-r-0 cursor-pointer group font-normal" onClick={() => toggleSortConnections("name")}>
							Name
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"name" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="max-w-8 p-0" />
						<Th className="cursor-pointer group font-normal" onClick={() => toggleSortConnections("platform")}>
							App
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"platform" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="cursor-pointer group font-normal" onClick={() => toggleSortConnections("user")}>
							User
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"user" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th
							className="border-r-0 pr-6 cursor-pointer group font-normal"
							onClick={() => toggleSortConnections("lastTested")}
						>
							Last tested
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"lastTested" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th
							className="max-w-9 border-0 p-0 -ml-6 cursor-pointer group"
							onClick={() => toggleSortConnections("lastTested")}
						/>
						<Th className="max-w-10 border-0" />
					</Tr>
				</THead>
				<TBody>
					{connections.map(({ name, platform, user, lastTested, id }) => (
						<Tr className="group" key={id}>
							<Td className="font-semibold border-r-0">{name}</Td>
							<Td className="p-0 max-w-8">
								<DropdownButton className="flex-col gap-1" contentMenu={<TableConnectionInfo />}>
									<IconButton className="w-6 h-6 p-1 hover:bg-transparent">
										<Info className="w-4 h-4 transition fill-gray-500 group-hover:fill-white" />
									</IconButton>
								</DropdownButton>
							</Td>
							<Td>{platform}</Td>
							<Td>{user}</Td>
							<Td className="text-xs border-r-0 pr-6">{moment(lastTested).fromNow()}</Td>
							<Td className="max-w-9 border-0 p-0 -ml-6">
								<IconButton className="w-6 h-6 p-1 hover:bg-gray-700">
									<TestS className="w-4 h-4 transition fill-gray-500 group-hover:fill-white" />
								</IconButton>
							</Td>
							<Td className="max-w-10 border-0 pr-1.5 justify-end">
								<DropdownButton
									className="flex-col gap-1"
									contentMenu={<TableConnectionAction onDelete={toggleModal} />}
								>
									<IconButton className="w-6 h-6 p-1  hover:bg-gray-700">
										<ThreeDots className="w-full h-full transition fill-gray-500 group-hover:fill-white" />
									</IconButton>
								</DropdownButton>
							</Td>
						</Tr>
					))}
				</TBody>
			</Table>
			<Modal isOpen={isModal} onClose={toggleModal}>
				<div className="mx-6">
					<h3 className="text-xl font-bold mb-5">Delete Connection</h3>
					<p>
						This connection you are about to delete is used in <br />
						<strong>3 projects, 2 of them are currently running.</strong>
					</p>
					<br />
					<p>
						Deleting the connection may cause failure of projects. <br /> Are you sure you want to delete this
						connection?
					</p>
				</div>
				<div className="flex justify-end gap-1 mt-14">
					<Button className="font-semibold py-3 px-4 hover:text-white w-auto" onClick={toggleModal}>
						Cancel
					</Button>
					<Button className="font-semibold py-3 px-4 bg-gray-700 w-auto" onClick={toggleModal} variant="filled">
						Yes, delete
					</Button>
				</div>
			</Modal>
		</div>
	);
};
