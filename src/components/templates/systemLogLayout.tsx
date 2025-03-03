import React, { useId } from "react";

import { defaultSystemLogSize } from "@src/constants";
import { useResize } from "@src/hooks";
import { useLoggerStore } from "@src/store";

export const SystemLogLayout = ({ children }: { children: React.ReactNode }) => {
	const { setSystemLogHeight, systemLogHeight } = useLoggerStore();

	const resizeId = useId();

	useResize({
		direction: "vertical",
		...defaultSystemLogSize,
		id: resizeId,
		value: systemLogHeight,
		onChange: (newVal) => {
			setSystemLogHeight(newVal);
		},
	});
	return (
		<div className="flex h-screen w-screen flex-1">
			<div className="m-2 flex flex-1 flex-col overflow-hidden rounded-xl">{children}</div>
		</div>
	);
};
