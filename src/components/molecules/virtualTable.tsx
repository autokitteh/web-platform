import React, { forwardRef, useRef } from "react";

import { FixedSizeList, FixedSizeListProps } from "react-window";

const Inner = forwardRef<HTMLTableElement, React.HTMLProps<HTMLDivElement>>(function Inner({ children, ...rest }, ref) {
	return (
		<table style={{ position: "absolute", width: "100%" }} {...rest} ref={ref}>
			<tbody>{children}</tbody>
		</table>
	);
});
export const VirtualTable = ({
	row,
	...rest
}: {
	row: FixedSizeListProps["children"];
} & Omit<FixedSizeListProps, "children" | "innerElementType">) => {
	const listRef = useRef<FixedSizeList | null>();

	return (
		<FixedSizeList
			{...rest}
			className="scrollbar"
			innerElementType={Inner}
			ref={(element) => {
				listRef.current = element;
			}}
		>
			{row}
		</FixedSizeList>
	);
};
