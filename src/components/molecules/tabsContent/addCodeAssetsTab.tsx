import React from "react";

import { Icon } from "@components/atoms";

import { PlusCircle } from "@assets/image";

export const AddCodeAssetsTab = () => {
	return (
		<div className="h-full flex justify-center items-center">
			<div className=" group flex flex-col items-center gap-2.5 cursor-pointer">
				<Icon src={PlusCircle} className="stroke-gray-400 group-hover:stroke-green-accent" />
				<p className="max-w-[165px] text-center text-lg font-bold uppercase">Add Code & Assets</p>
			</div>
		</div>
	);
};
