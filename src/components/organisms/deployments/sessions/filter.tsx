import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { SessionStateType } from "@enums";
import { SessionTableFilterProps } from "@interfaces/components";
import { cn, getSessionStateColor } from "@utilities";

import { Button, IconSvg } from "@components/atoms";
import { DropdownButton } from "@components/molecules";

import { FilterIcon } from "@assets/image/icons";

export const SessionsTableFilter = ({ onChange, sessionStats, selectedState }: SessionTableFilterProps) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.table.statuses" });

	const validatedState: SessionStateType | undefined =
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

	const initialSessionCounts = {
		[SessionStateType.completed]: 0,
		[SessionStateType.created]: 0,
		[SessionStateType.error]: 0,
		[SessionStateType.running]: 0,
		[SessionStateType.stopped]: 0,
	};

	const sessionCounts = useMemo(
		() =>
			sessionStats.reduce(
				(acc, stat) => {
					acc[stat.state!] = stat.count;
					acc.total += stat.count;

					return acc;
				},
				{ total: 0, ...initialSessionCounts }
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[sessionStats]
	);

	return (
		<div className="flex items-center">
			<DropdownButton
				contentMenu={
					<div className="flex flex-col gap-y-2">
						<Button className={buttonClass()} onClick={() => onChange()}>
							{t("all")} ({sessionCounts.total})
						</Button>

						<Button
							className={buttonClass(SessionStateType.running)}
							onClick={() => onChange(SessionStateType.running)}
						>
							{t("running")} ({sessionCounts.running})
						</Button>

						<Button
							className={buttonClass(SessionStateType.stopped)}
							onClick={() => onChange(SessionStateType.stopped)}
						>
							{t("stopped")} ({sessionCounts.stopped})
						</Button>

						<Button
							className={buttonClass(SessionStateType.error)}
							onClick={() => onChange(SessionStateType.error)}
						>
							{t("error")} ({sessionCounts.error})
						</Button>

						<Button
							className={buttonClass(SessionStateType.completed)}
							onClick={() => onChange(SessionStateType.completed)}
						>
							{t("completed")} ({sessionCounts.completed})
						</Button>
					</div>
				}
			>
				<Button className={filterClass(validatedState)} variant="outline">
					<IconSvg className="mb-1 text-white" size="md" src={FilterIcon} />
					{validatedState
						? `${t(validatedState)} (${sessionCounts[validatedState]})`
						: `${t("all")} (${sessionCounts.total})`}
				</Button>
			</DropdownButton>
		</div>
	);
};
