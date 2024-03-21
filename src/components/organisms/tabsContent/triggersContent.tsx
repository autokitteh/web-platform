import React, { useState, useEffect } from "react";
import { PlusCircle, ThreeDots } from "@assets/image";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button } from "@components/atoms";
import { SortButton, DropdownButton } from "@components/molecules";
import { ModalDeleteConnection } from "@components/organisms/modals";
import { EModalName, ESortDirection } from "@enums/components";
import { TriggersService } from "@services";
import { useModalStore } from "@store";
import { TSortDirection } from "@type/components";
import { Trigger } from "@type/models";
import { orderBy } from "lodash";

export const TriggersContent = () => {
	const { openModal } = useModalStore();
	const [sort, setSort] = useState<{
		direction: TSortDirection;
		column: keyof Trigger;
	}>({ direction: ESortDirection.ASC, column: "name" });
	const [triggers, setTriggers] = useState<Trigger[]>([]);

	useEffect(() => {
		const fetchTriggers = async () => {
			const { data } = await TriggersService.list();
			data && setTriggers(data);
		};
		fetchTriggers();
	}, []);

	const toggleSortTriggers = (key: keyof Trigger) => {
		const newDirection =
			sort.column === key && sort.direction === ESortDirection.ASC ? ESortDirection.DESC : ESortDirection.ASC;

		const sortedConnections = orderBy(triggers, [key], [newDirection]);
		setSort({ direction: newDirection, column: key });
		setTriggers(sortedConnections);
	};

	return (
		<div className="pt-14">
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">Available triggers</div>
				<Button
					className="w-auto group gap-1 p-0 capitalize font-semibold text-gray-300 hover:text-white"
					href="new-connection"
				>
					<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
					Add new
				</Button>
			</div>
			<Table className="mt-5">
				<THead>
					<Tr>
						<Th className="cursor-pointer group font-normal" onClick={() => toggleSortTriggers("name")}>
							Name
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"name" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="cursor-pointer group font-normal" onClick={() => toggleSortTriggers("path")}>
							Path
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"path" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="cursor-pointer group font-normal" onClick={() => toggleSortTriggers("eventType")}>
							Event Type
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"eventType" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th
							className="border-r-0 cursor-pointer group font-normal"
							onClick={() => toggleSortTriggers("connectionId")}
						>
							Connection ID
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"connectionId" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="max-w-10 border-0" />
					</Tr>
				</THead>
				<TBody>
					{triggers?.map(({ triggerId, connectionId, eventType, path, name }) => (
						<Tr className="group" key={triggerId}>
							<Td className="font-semibold">{name}</Td>
							<Td>{path}</Td>
							<Td>{eventType}</Td>
							<Td className="text-xs border-r-0">{connectionId}</Td>
							<Td className="max-w-10 border-0 pr-1.5 justify-end">
								<DropdownButton
									className="flex-col gap-1"
									contentMenu={
										<Button
											className="px-4 py-1.5 hover:bg-gray-700 rounded-md text-white"
											onClick={() => openModal(EModalName.deleteConnection)}
										>
											Delete
										</Button>
									}
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
			<ModalDeleteConnection />
		</div>
	);
};
