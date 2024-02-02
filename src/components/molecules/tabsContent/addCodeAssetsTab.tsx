import React from "react";
import { PlusCircle } from "@assets/image";
import { Icon } from "@components/atoms";

export const AddCodeAssetsTab = () => {
	return (
		<div className="h-full flex justify-center items-center">
			<div className=" group flex flex-col items-center gap-2.5 cursor-pointer">
				<Icon className="stroke-gray-400 group-hover:stroke-green-accent" src={PlusCircle} />
				<p className="max-w-[165px] text-center text-lg font-bold uppercase">Add Code & Assets</p>
			</div>
		</div>
	);
};
