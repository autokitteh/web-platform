import React from "react";
import { SessionStateType } from "@enums";
import { DeploymentSession } from "@type/models";
import { cn } from "@utilities";

export const DeploymentSessionStats = ({ sessionStats }: { sessionStats?: DeploymentSession[] }) => {
	const countStyle = (state?: SessionStateType) =>
		cn("font-medium text-sm p-0 border-0 2xl:w-20 w-14 inline-block", {
			"text-gray-black": SessionStateType.stopped === state,
			"text-green-accent": SessionStateType.completed === state,
			"hidden": SessionStateType.created === state,
			"text-error": SessionStateType.error === state,
		});

	return sessionStats?.map(({ count, state }) => (
		<span aria-label={state} className={countStyle(state)} key={state} role="status" title={state}>
			{count}
		</span>
	));
};
