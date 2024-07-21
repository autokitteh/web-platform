import React from "react";

import { LoggerLevel } from "@enums";
import { OutputTabsVariants } from "@enums/components";

import { useLoggerStore } from "@store";

import { Tab } from "@components/atoms";

import { TrashCanIcon } from "@assets/image/icons";

export const OutputTabs: React.FC = () => {
	const logs = useLoggerStore((state) => state.logs);
	const clearLogs = useLoggerStore((state) => state.clearLogs);

	const ouputTextStyle = {
		[LoggerLevel.debug]: "",
		[LoggerLevel.error]: "text-error-200",
		[LoggerLevel.info]: "",
		[LoggerLevel.log]: "",
		[LoggerLevel.warn]: "text-yellow-500",
	} as const;

	return (
		<div className="flex h-full flex-col pb-3">
			<div
				className={
					`static top-4 flex h-8 select-none items-center gap-1 uppercase xl:gap-2 2xl:gap-4 3xl:gap-5 ` +
					`scrollbar w-full overflow-x-auto overflow-y-hidden whitespace-nowrap`
				}
			>
				<Tab activeTab={OutputTabsVariants.output} value={OutputTabsVariants.output}>
					output
				</Tab>

				<div className="mb-1 flex w-full items-center justify-end">
					<button
						className="h-5 w-5 cursor-pointer fill-white hover:h-6 hover:w-6 hover:rounded-full hover:border-4 hover:border-white hover:bg-gray-black-200 hover:fill-gray-black-500"
						onClick={() => clearLogs()}
					>
						<TrashCanIcon className="h-4 w-4" />
					</button>
				</div>
			</div>

			<div className="scrollbar h-48 flex-auto overflow-auto pt-6">
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
