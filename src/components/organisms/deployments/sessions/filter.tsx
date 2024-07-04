import { Button } from "@components/atoms";
import { SessionStateType } from "@enums";
import { SessionTableFilterProps } from "@interfaces/components";
import { SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export const SessionsTableFilter = ({ onChange, sessionStats }: SessionTableFilterProps) => {
	const [activeState, setActiveState] = useState<SessionStateKeyType>();
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.table.statuses" });

	const buttonClassText = {
		[SessionStateType.running]: "",
		[SessionStateType.error]: "text-red",
		[SessionStateType.completed]: "text-green-accent",
		[SessionStateType.stopped]: "text-yellow-500",
	} as const;

	const buttonClass = (state?: keyof typeof buttonClassText) =>
		cn("w-auto border border-gray-500 px-2.5 py-1.5 rounded-lg text-white", state && buttonClassText[state], {
			"bg-gray-800 border-white": activeState === state,
		});

	const handleButtonClick = (state?: SessionStateKeyType) => {
		setActiveState(state);
		onChange(state);
	};

	const initialSessionCounts = {
		[SessionStateType.created]: 0,
		[SessionStateType.running]: 0,
		[SessionStateType.error]: 0,
		[SessionStateType.completed]: 0,
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
		<div className="flex flex-wrap gap-x-3 gap-y-2 items-center">
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

			<Button className={buttonClass(SessionStateType.error)} onClick={() => handleButtonClick(SessionStateType.error)}>
				{t("error")} ({sessionCounts.error})
			</Button>

			<Button
				className={buttonClass(SessionStateType.completed)}
				onClick={() => handleButtonClick(SessionStateType.completed)}
			>
				{t("completed")} ({sessionCounts.completed})
			</Button>
		</div>
	);
};
