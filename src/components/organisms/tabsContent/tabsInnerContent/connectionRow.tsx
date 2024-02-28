import React from "react";
import { Info, TestS, ThreeDots } from "@assets/image";
import { IconButton, Tr, Td } from "@components/atoms";
import { ITabConnection } from "@interfaces/components";

interface IConnectionRow {
	connection: ITabConnection;
	handleHoverIcon: (event: React.MouseEvent<HTMLButtonElement>) => void;
	handleLeaveDropdown: () => void;
}

export const ConnectionRow = ({ connection, handleHoverIcon, handleLeaveDropdown }: IConnectionRow) => (
	<Tr className="group">
		<Td className="font-semibold border-r-0">{connection.name}</Td>
		<Td className="p-0 max-w-8">
			<IconButton
				className="w-6 h-6 p-1 hover:bg-transparent"
				onMouseEnter={handleHoverIcon}
				onMouseLeave={handleLeaveDropdown}
			>
				<Info className="w-4 h-4 transition fill-gray-500 group-hover:fill-white" />
			</IconButton>
		</Td>
		<Td>{connection.platform}</Td>
		<Td>{connection.user}</Td>
		<Td className="text-xs border-r-0">{connection.lastTested}</Td>
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
);
