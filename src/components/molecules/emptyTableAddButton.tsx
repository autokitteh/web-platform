import React from "react";

import { cn } from "@utilities";

import { Button } from "@components/atoms";

import { PlusCircle } from "@assets/image";

export const EmptyTableAddButton = ({ buttonText, onClick }: { buttonText: string; onClick: () => void }) => {
	const styleFrame = cn("relative rounded-lg");

	return (
		<div className="flex size-full items-center justify-center">
			<Button className="hover:bg-transparent" onClick={onClick}>
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
		</div>
	);
};
