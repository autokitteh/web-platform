import React from "react";
import { PlusCircle } from "@assets/image";
import { Button } from "@components/atoms";

export const AddCodeAssetsTab = () => {
	return (
		<div className="h-full flex justify-center items-center">
			<Button className=" group flex flex-col items-center gap-2.5 cursor-pointer">
				<PlusCircle className="transition stroke-gray-400 group-hover:stroke-green-accent" />
				<p className="text-center text-lg font-bold uppercase text-white">Add Code & Assets</p>
			</Button>
		</div>
	);
};
