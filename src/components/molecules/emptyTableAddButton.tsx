import React from "react";

import { cn } from "@src/utilities";

import { Button } from "@components/atoms";

import { PlusCircle } from "@assets/image";

export const EmptyTableAddButton = ({ buttonText, onClick }: { buttonText: string; onClick: () => void }) => {
	const styleFrame = cn(
		"absolute top-0 z-10 flex h-full w-full items-center justify-center rounded-lg duration-300",
		"pointer-events-none select-none opacity-1 pointer-events-auto"
	);

	return (
		<Button onClick={onClick}>
			<div className={styleFrame}>
				<div className="flex flex-col items-center gap-2.5">
					<label
						className={cn(
							"group flex cursor-pointer flex-col items-center gap-2.5",
							"text-center text-lg font-bold uppercase text-white"
						)}
					>
						<PlusCircle className="stroke-gray-750 duration-300 group-hover:stroke-green-800" />

						{buttonText}
					</label>
				</div>
			</div>
		</Button>
	);
};
