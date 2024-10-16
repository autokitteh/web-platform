import React from "react";

import { useTranslation } from "react-i18next";

import { LoggerLevel } from "@enums";
import { OutputTabsVariants } from "@enums/components";
import { cn } from "@src/utilities";

import { useLoggerStore } from "@store";

import { Button, IconSvg, Tab } from "@components/atoms";

import { TrashIcon } from "@assets/image/icons";

export const OutputTabs = () => {
	const { clearLogs, logs } = useLoggerStore();
	const { t } = useTranslation("projects", { keyPrefix: "outputLog" });

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
					`static -my-2 flex h-14 select-none items-center gap-1 uppercase xl:gap-2 2xl:gap-4 3xl:gap-5 ` +
					`scrollbar overflow-x-auto overflow-y-hidden whitespace-nowrap`
				}
			>
				<Tab activeTab={OutputTabsVariants.output} value={OutputTabsVariants.output}>
					output
				</Tab>

				<Button className="ml-auto" onClick={() => clearLogs()} title={t("clear")}>
					<IconSvg className="stroke-white" src={TrashIcon} />
				</Button>
			</div>

			<div className="scrollbar h-48 flex-auto overflow-auto pt-5">
				{logs.map(({ id, message, status, timestamp }) => (
					<div className="mb-4 font-mono" key={id}>
						<span className="font-medium text-gray-250">{timestamp}:</span>

						<div className={cn("inline ml-2", ouputTextStyle[status])}>{message}</div>
					</div>
				))}
			</div>
		</div>
	);
};
