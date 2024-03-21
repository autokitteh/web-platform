import React, { useState } from "react";
import { PlusCircle, ThreeDots } from "@assets/image";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button } from "@components/atoms";
import { SortButton, DropdownButton } from "@components/molecules";
import { ModalDeleteConnection } from "@components/organisms/modals";
import { triggersData } from "@constants/lists";
import { EModalName, ESortDirection } from "@enums/components";
import { ITabTrigger } from "@interfaces/components";
import { useModalStore } from "@store";
import { TSortDirection } from "@type/components";
import { orderBy } from "lodash";

export const TriggersContent = () => {
	const { openModal } = useModalStore();
	const [sort, setSort] = useState<{
		direction: TSortDirection;
		column: Exclude<keyof ITabTrigger, "id">;
	}>({ direction: ESortDirection.ASC, column: "fileName" });
	const [triggers, setTriggers] = useState(triggersData);

	const toggleSortTriggers = (key: Exclude<keyof ITabTrigger, "id">) => {
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
						<Th className="cursor-pointer group font-normal" onClick={() => toggleSortTriggers("fileName")}>
							File
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"fileName" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="cursor-pointer group font-normal" onClick={() => toggleSortTriggers("func")}>
							func
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"func" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="cursor-pointer group font-normal max-w-20" onClick={() => toggleSortTriggers("row")}>
							Row
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"row" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th
							className="border-r-0 pr-6 cursor-pointer group font-normal max-w-20"
							onClick={() => toggleSortTriggers("col")}
						>
							Col
							<SortButton
								className="opacity-0 group-hover:opacity-100"
								isActive={"col" === sort.column}
								sortDirection={sort.direction}
							/>
						</Th>
						<Th className="max-w-10 border-0" />
					</Tr>
				</THead>
				<TBody>
					{triggers.map(({ id, fileName, func, row, col }) => (
						<Tr className="group" key={id}>
							<Td className="font-semibold">{fileName}</Td>
							<Td>{func}</Td>
							<Td className="max-w-20">{row}</Td>
							<Td className="text-xs border-r-0 max-w-20">{col}</Td>
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
