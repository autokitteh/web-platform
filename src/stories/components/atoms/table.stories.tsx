import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { TBody, THead, Table, Td, Th, Tr } from "@components/atoms";

const list = [
	{ id: "1", name: "Project1" },
	{ id: "2", name: "Project2" },
	{ id: "3", name: "Project3" },
];

const DarkTable = () => (
	<Table className="max-h-96">
		<THead>
			<Tr>
				<Th className="group max-w-40 cursor-pointer border-r-0 font-normal">Id</Th>

				<Th className="group cursor-pointer border-r-0 font-normal">Name</Th>
			</Tr>
		</THead>

		<TBody>
			{list.map(({ id, name }) => (
				<Tr key={id}>
					<Td className="max-w-40 cursor-pointer font-medium">{id}</Td>

					<Td className="cursor-pointer font-medium">{name}</Td>
				</Tr>
			))}
		</TBody>
	</Table>
);

const LightTable = () => (
	<Table className="mt-2.5 max-h-96 rounded-t-20" variant="light">
		<THead>
			<Tr className="border-none pl-6">
				<Th className="group max-w-40 cursor-pointer border-r-0 font-normal">Id</Th>

				<Th className="group cursor-pointer border-r-0 font-normal">Name</Th>
			</Tr>
		</THead>

		<TBody>
			{list.map(({ id, name }) => (
				<Tr className="group cursor-pointer border-none pl-6" key={id}>
					<Td className="max-w-40 cursor-pointer font-medium">{id}</Td>

					<Td className="cursor-pointer font-medium">{name}</Td>
				</Tr>
			))}
		</TBody>
	</Table>
);

const meta = {
	title: "Display/Table",
	component: DarkTable,
	argTypes: {},
} satisfies Meta<typeof DarkTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dark = {
	render: () => <DarkTable />,
} satisfies Story;

export const Light = {
	render: () => <LightTable />,
} satisfies Story;
