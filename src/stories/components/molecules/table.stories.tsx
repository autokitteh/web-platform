import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ColorSchemes } from "@type";
import { cn } from "@utilities";

import { useSort } from "@hooks";

import { TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

const list = [
	{ id: "1", name: "Project1" },
	{ id: "2", name: "Project2" },
	{ id: "3", name: "Project3" },
];

const PrimaryTable = ({ variant = "dark" }: { variant?: ColorSchemes }) => {
	const trClass = cn({
		"border-none": variant === "light",
	});
	const bodyTrClass = cn({
		"group cursor-pointer border-none": variant === "light",
	});
	const variantProp = variant === "dark" ? undefined : "light";

	return (
		<Table variant={variantProp}>
			<THead>
				<Tr className={trClass}>
					<Th className="group w-1/2 max-w-40 cursor-pointer border-r-0 pl-4 font-normal">Id</Th>

					<Th className="group w-1/2 cursor-pointer border-r-0 font-normal">Name</Th>
				</Tr>
			</THead>

			<TBody>
				{list.map(({ id, name }) => (
					<Tr className={bodyTrClass} key={id}>
						<Td className="w-1/2 max-w-40 cursor-pointer font-medium">{id}</Td>

						<Td className="group w-1/2 cursor-pointer font-medium">{name}</Td>
					</Tr>
				))}
			</TBody>
		</Table>
	);
};

const SortTable = ({ variant = "light" }: { variant?: ColorSchemes }) => {
	const { items, requestSort, sortConfig } = useSort<(typeof list)[number]>(list, "id");
	const trClass = cn({
		"border-none": variant === "light",
	});
	const bodyTrClass = cn({
		"group cursor-pointer border-none": variant === "light",
	});

	const variantProp = variant === "dark" ? undefined : "light";

	return (
		<Table variant={variantProp}>
			<THead>
				<Tr className={trClass}>
					<Th
						className="group max-w-40 cursor-pointer border-r-0 font-normal"
						onClick={() => requestSort("id")}
					>
						Id
						<SortButton
							className="mt-0.5 opacity-0 group-hover:opacity-80"
							isActive={"id" === sortConfig.key}
							sortDirection={sortConfig.direction}
						/>
					</Th>

					<Th className="group cursor-pointer border-r-0 font-normal" onClick={() => requestSort("name")}>
						Name
						<SortButton
							className="mt-0.5 opacity-0 group-hover:opacity-100"
							isActive={"name" === sortConfig.key}
							sortDirection={sortConfig.direction}
						/>
					</Th>
				</Tr>
			</THead>

			<TBody>
				{items.map(({ id, name }) => (
					<Tr className={bodyTrClass} key={id}>
						<Td className="max-w-40 cursor-pointer font-medium">{id}</Td>

						<Td className="group cursor-pointer font-medium">{name}</Td>
					</Tr>
				))}
			</TBody>
		</Table>
	);
};

const meta = {
	title: "Display/Table",
	component: PrimaryTable,
	argTypes: {
		variant: {
			control: "inline-radio",
			options: ["light", "dark"],
		},
	},
} satisfies Meta<typeof PrimaryTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	render: (args) => <PrimaryTable {...args} />,
	args: {
		variant: "dark",
	},
} satisfies Story;

export const WithSort = {
	render: (args) => <SortTable {...args} />,
	args: {
		variant: "light",
	},
} satisfies Story;
