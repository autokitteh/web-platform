import React from "react";

import { useTranslation } from "react-i18next";

import { SessionStateType } from "@enums";
import { SessionTableFilterProps } from "@interfaces/components";
import { cn, getSessionStateColor } from "@utilities";

import { Button, IconSvg } from "@components/atoms";
import { DropdownButton } from "@components/molecules";

import { FilterIcon } from "@assets/image/icons";

export const SessionsTableFilter = ({ onChange, filtersData, selectedState }: SessionTableFilterProps) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.table.statuses" });

	const validatedState =
		selectedState && Object.values(SessionStateType).includes(selectedState) ? selectedState : undefined;

	const buttonClass = (state?: SessionStateType) =>
		cn(
			"w-auto rounded-lg border border-gray-950 px-2.5 py-1.5 text-white hover:bg-gray-1150",
			state && getSessionStateColor(state),
			{
				"border-white bg-gray-1250": selectedState === state,
			}
		);

	const filterClass = (state?: SessionStateType) =>
		cn("h-8 whitespace-nowrap border-0 pr-4 text-white hover:bg-transparent", state && getSessionStateColor(state));

	return (
		<DropdownButton
			contentMenu={
				<div className="flex flex-col gap-y-2">
					<Button className={buttonClass()} onClick={() => onChange(null)}>
						{t("all")} ({filtersData.totalSessionsCount})
					</Button>

					<Button
						className={buttonClass(SessionStateType.running)}
						onClick={() => onChange(SessionStateType.running)}
					>
						{t("running")} ({filtersData.sessionStats.running})
					</Button>

					<Button
						className={buttonClass(SessionStateType.stopped)}
						onClick={() => onChange(SessionStateType.stopped)}
					>
						{t("stopped")} ({filtersData.sessionStats.stopped})
					</Button>

					<Button
						className={buttonClass(SessionStateType.error)}
						onClick={() => onChange(SessionStateType.error)}
					>
						{t("error")} ({filtersData.sessionStats.error})
					</Button>

					<Button
						className={buttonClass(SessionStateType.completed)}
						onClick={() => onChange(SessionStateType.completed)}
					>
						{t("completed")} ({filtersData.sessionStats.completed})
					</Button>
				</div>
			}
		>
			<Button className={filterClass(validatedState)} variant="outline">
				<IconSvg className="mb-1 text-white" size="md" src={FilterIcon} />
				{validatedState
					? `${t(validatedState)} (${filtersData.sessionStats[validatedState]})`
					: `${t("all")} (${filtersData.totalSessionsCount})`}
			</Button>
		</DropdownButton>
	);
};
