import React from "react";

import { SessionStateType } from "@enums";
import { DeploymentSession } from "@type/models";
import { cn } from "@utilities";

export const DeploymentSessionStats = ({ sessionStats }: { sessionStats?: DeploymentSession[] }) => {
	const countStyle = (state?: SessionStateType) =>
		cn("2xl:w-22 inline-block w-14 border-0 p-0 text-sm font-medium", {
			"hidden": SessionStateType.created === state,
			"text-gray-black": SessionStateType.stopped === state,
			"text-green-accent": SessionStateType.completed === state,
			"text-red": SessionStateType.error === state,
		});

	return sessionStats?.map(({ count, state }) => (
		<span aria-label={state} className={countStyle(state)} key={state} role="status" title={state}>
			{count}
		</span>
	));
};
