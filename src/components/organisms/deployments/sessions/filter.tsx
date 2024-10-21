import React, { useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { SessionStateType } from "@enums";
import { SessionTableFilterProps } from "@interfaces/components";
import { SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";

import { Button, IconSvg } from "@components/atoms";
import { DropdownButton } from "@components/molecules";

import { FilterIcon } from "@assets/image/icons";

export const SessionsTableFilter = ({ onChange, sessionStats }: SessionTableFilterProps) => {
	const [activeState, setActiveState] = useState<SessionStateKeyType>();
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.table.statuses" });
	const { t: tTable } = useTranslation("deployments", { keyPrefix: "sessions.table" });

	const buttonClassText = {
		[SessionStateType.completed]: "text-green-800",
		[SessionStateType.error]: "text-red",
		[SessionStateType.running]: "text-blue-500",
		[SessionStateType.stopped]: "text-yellow-500",
	} as const;

	const buttonClass = (state?: keyof typeof buttonClassText) =>
		cn("w-auto rounded-lg border border-gray-950 px-2.5 py-1.5 text-white", state && buttonClassText[state], {
			"border-white bg-gray-1250": activeState === state,
		});

	const handleButtonClick = (state?: SessionStateKeyType) => {
		setActiveState(state);
		onChange(state);
	};

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
						<Button className={buttonClass()} onClick={() => handleButtonClick()}>
							{t("all")} ({sessionCounts.total})
						</Button>

						<Button
							className={buttonClass(SessionStateType.running)}
							onClick={() => handleButtonClick(SessionStateType.running)}
						>
							{t("running")} ({sessionCounts.running})
						</Button>

						<Button
							className={buttonClass(SessionStateType.stopped)}
							onClick={() => handleButtonClick(SessionStateType.stopped)}
						>
							{t("stopped")} ({sessionCounts.stopped})
						</Button>

						<Button
							className={buttonClass(SessionStateType.error)}
							onClick={() => handleButtonClick(SessionStateType.error)}
						>
							{t("error")} ({sessionCounts.error})
						</Button>

						<Button
							className={buttonClass(SessionStateType.completed)}
							onClick={() => handleButtonClick(SessionStateType.completed)}
						>
							{t("completed")} ({sessionCounts.completed})
						</Button>
					</div>
				}
			>
				<div className="flex">
					<Button
						className="h-8 whitespace-nowrap border-0 pr-4 text-white hover:bg-transparent"
						variant="outline"
					>
						<IconSvg className="mb-1" size="md" src={FilterIcon} />
						{activeState ? t(activeState) : tTable("filter")}
					</Button>
				</div>
			</DropdownButton>
		</div>
	);
};
