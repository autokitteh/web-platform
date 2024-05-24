import React, { useState } from "react";
import { Button } from "@components/atoms";
import { SessionStateType } from "@enums";
import { SessionTableFilterProps } from "@interfaces/components";
import { SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";

export const SessionsTableFilter = ({ onChange }: SessionTableFilterProps) => {
	const [activeState, setActiveState] = useState<SessionStateKeyType>();

	const buttonClassText = {
		[SessionStateType.error]: "text-red",
		[SessionStateType.completed]: "text-green-accent",
		[SessionStateType.stopped]: "text-yellow-500",
	} as const;

	const buttonClass = (state?: keyof typeof buttonClassText) =>
		cn("w-auto border border-gray-500 px-2.5 py-1.5 rounded-lg text-white", state && buttonClassText[state], {
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
			<Button className={buttonClass()} onClick={() => handleButtonClick()}>
				All
			</Button>
			{filteredSessionStates.map((sessionState) => (
				<Button
					className={buttonClass(sessionState as keyof typeof buttonClassText)}
					key={sessionState}
					onClick={() => handleButtonClick(sessionState)}
				>
					{capitalizeFirstLetter(sessionState)}
				</Button>
			))}
		</div>
	);
};
