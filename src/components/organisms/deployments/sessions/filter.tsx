import React, { useState } from "react";
import { Button } from "@components/atoms";
import { SessionStateType } from "@enums";
import { SessionTableFilterProps } from "@interfaces/components";
import { SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";

export const SessionsTableFilter = ({ onChange }: SessionTableFilterProps) => {
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

	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
			<Button className={buttonClass()} onClick={() => handleButtonClick()}>
				{t("all")}
			</Button>
			<Button
				className={buttonClass(SessionStateType.running)}
				onClick={() => handleButtonClick(SessionStateType.running)}
			>
				{t("running")}
			</Button>
			<Button
				className={buttonClass(SessionStateType.stopped)}
				onClick={() => handleButtonClick(SessionStateType.stopped)}
			>
				{t("stopped")}
			</Button>
			<Button className={buttonClass(SessionStateType.error)} onClick={() => handleButtonClick(SessionStateType.error)}>
				{t("error")}
			</Button>
			<Button
				className={buttonClass(SessionStateType.completed)}
				onClick={() => handleButtonClick(SessionStateType.completed)}
			>
				{t("completed")}
			</Button>
		</div>
	);
};
