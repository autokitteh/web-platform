import { CSSProperties } from "react";

import { SessionActivity } from "@interfaces/models";

export interface ActivityRowProps {
	data: SessionActivity;
	index: number;
	style: CSSProperties;
	setActivity: (activity: SessionActivity) => void;
}
