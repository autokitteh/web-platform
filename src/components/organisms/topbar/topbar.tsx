import React from "react";

import { cn } from "@src/utilities";

export const TitleTopbar = ({
	title,
	headerLevel = 1,
	className,
}: {
	className?: string;
	headerLevel?: 1 | 2 | 3 | 4 | 5 | 6;
	title: string;
}) => {
	const headingTag = `h${headerLevel}` as keyof JSX.IntrinsicElements;
	const wrapperClassName = cn(
		"flex items-center justify-between gap-5 rounded-b-xl bg-gray-1250 py-3 pl-7",
		className
	);
	return (
		<div className={wrapperClassName}>
			{React.createElement(
				headingTag,
				{
					className:
						"min-w-3 rounded bg-transparent p-0 font-fira-code text-xl font-bold leading-tight text-gray-500 outline outline-0",
				},
				title
			)}
		</div>
	);
};
