import React, { useRef } from "react";

import { FixedSizeList, FixedSizeListProps } from "react-window";

const Inner = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function Inner(
	{ children, ...rest },
	ref
) {
	return (
		<div {...rest} ref={ref}>
			<table style={{ position: "absolute", width: "100%" }}>
				<tbody>{children}</tbody>
			</table>
		</div>
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
			innerElementType={Inner}
			// eslint-disable-next-line no-return-assign
			ref={(element) => (listRef.current = element)}
		>
			{row}
		</FixedSizeList>
	);
};
