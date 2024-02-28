/* eslint-disable react/jsx-max-depth */
import React, { useState } from "react";
import { PlusCircle, Info, SmallArrowDown, TestS, ThreeDots } from "@assets/image";
import { Table, THead, TBody, Tr, Th, Td, IconButton, Button } from "@components/atoms";
import { Modal, DropdownButton, TableConnectionInfo, TableConnectionAction } from "@components/molecules";
import { IConnectionsContent } from "@interfaces/components";
import { cn } from "@utilities";
import { Link } from "react-router-dom";

export const ConnectionsContent = ({ className }: IConnectionsContent) => {
	const [isModal, setIsModal] = useState(false);

	const baseStyle = cn("pt-14", className);

	const toggleModal = () => setIsModal(!isModal);

	return (
		<div className={baseStyle}>
			<div className="flex items-center justify-between text-gray-300">
				<p className="text-base">Available connections</p>
				<Link to="/app/new-connection">
					<p className="capitalize font-semibold cursor-pointer group hover:text-white flex items-center gap-1">
						<PlusCircle className="transtion stroke-gray-300 group-hover:stroke-white w-5 h-5" />
						add new
					</p>
				</Link>
			</div>
			<Table className="mt-5">
				<THead>
					<Tr className="group">
						<Th className="border-r-0">
							Name
							<IconButton className="w-auto p-1 hover:bg-gray-700">
								<SmallArrowDown className="w-2 h-1.5" />
							</IconButton>
						</Th>
						<Th className="max-w-8 p-0" />
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
						<Td className="p-0 max-w-8 overflow-visible">
							<DropdownButton className="flex-col gap-1" contentMenu={<TableConnectionInfo />}>
								<IconButton className="w-6 h-6 p-1 hover:bg-transparent">
									<Info className="w-4 h-4 transition fill-gray-500 group-hover:fill-white" />
								</IconButton>
							</DropdownButton>
						</Td>
						<Td>Slack</Td>
						<Td>Jeff@autokitteh.</Td>
						<Td className="relative text-xs border-r-0">2 days ago</Td>
						<Td className="max-w-10 border-0 p-0">
							<IconButton className="w-6 h-6 p-1 hover:bg-gray-700">
								<TestS className="w-4 h-4 transition fill-gray-500 group-hover:fill-white" />
							</IconButton>
						</Td>
						<Td className="max-w-10 border-0 pr-1 justify-end">
							<DropdownButton className="flex-col gap-1" contentMenu={<TableConnectionAction onDelete={toggleModal} />}>
								<IconButton className="w-6 h-6 p-1  hover:bg-gray-700">
									<ThreeDots className="w-full h-full transition fill-gray-500 group-hover:fill-white" />
								</IconButton>
							</DropdownButton>
						</Td>
					</Tr>
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
