import React, { useState } from "react";
import { Button } from "@components/atoms";
import { SessionStateType } from "@enums";
import { SessionTableFilterProps } from "@interfaces/components";
import { SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";

export const SessionsTableFilter = ({ onChange }: SessionTableFilterProps) => {
	const [activeState, setActiveState] = useState<SessionStateKeyType>();

	const buttonStyle = {
		[SessionStateType.error]: "text-red",
		[SessionStateType.completed]: "text-green-accent",
		[SessionStateType.stopped]: "text-yellow-500",
	} as const;

	const baseStyle = (state?: keyof typeof buttonStyle) =>
		cn("w-auto border border-gray-500 px-2.5 py-1.5 rounded-lg text-white", state && buttonStyle[state], {
			"bg-gray-800 border-white": activeState === state,
		});

	const capitalizeFirstLetter = (str: string) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	const filteredSessionStates = (Object.keys(SessionStateType) as Array<SessionStateKeyType>).filter(
		(state) => state !== SessionStateType.created
	);

	const handleButtonClick = (state?: SessionStateKeyType) => {
		setActiveState(state);
		onChange(state);
	};

	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
			<Button className={baseStyle()} onClick={() => handleButtonClick()}>
				All
			</Button>
			{filteredSessionStates.map((sessionState) => (
				<Button
					className={baseStyle(sessionState as keyof typeof buttonStyle)}
					key={sessionState}
					onClick={() => handleButtonClick(sessionState)}
				>
					{capitalizeFirstLetter(sessionState)}
				</Button>
			))}
		</div>
	);
};
