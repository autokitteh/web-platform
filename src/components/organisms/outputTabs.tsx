import { Tab } from "@components/atoms";
import { LoggerLevel } from "@enums";
import { OutputTabsVariants } from "@enums/components";
import { useLoggerStore } from "@store";
import React from "react";

export const OutputTabs: React.FC = () => {
	const logs = useLoggerStore((state) => state.logs);

	const ouputTextStyle = {
		[LoggerLevel.error]: "text-error-200",
		[LoggerLevel.warn]: "text-yellow-500",
		[LoggerLevel.debug]: "",
		[LoggerLevel.info]: "",
		[LoggerLevel.log]: "",
	} as const;

	return (
		<div className="flex flex-1 flex-col">
			<div
				className={
					`static top-4 h-8 uppercase flex items-center gap-1 xl:gap-2 2xl:gap-4 3xl:gap-5 select-none ` +
					`overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar mb-2`
				}
			>
				<Tab activeTab={OutputTabsVariants.output} value={OutputTabsVariants.output}>
					output
				</Tab>
			</div>

			<div className="flex-auto h-48 mt-4 overflow-auto pt-6 scrollbar">
				{logs.map(({ id, message, status, timestamp }) => (
					<div className="mb-4" key={id}>
						<p className="font-medium text-gray-200">{timestamp}</p>

						<p className={ouputTextStyle[status]}>{message}</p>
					</div>
				))}
			</div>
		</div>
	);
};
