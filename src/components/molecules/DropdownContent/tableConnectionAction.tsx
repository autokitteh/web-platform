import React from "react";
import { Button } from "@components/atoms";
import { ITableConnectionAction } from "@interfaces/components/dropdown";

export const TableConnectionAction = ({ onDelete }: ITableConnectionAction) => (
	<>
		<Button className="px-4 py-1.5 hover:bg-gray-700 rounded-md text-white" href="#">
			Modify
		</Button>
		<Button className="px-4 py-1.5 hover:bg-gray-700 rounded-md text-white" href="#">
			Documentation
		</Button>
		<Button className="px-4 py-1.5 hover:bg-gray-700 rounded-md text-white" onClick={onDelete}>
			Delete
		</Button>
	</>
);
