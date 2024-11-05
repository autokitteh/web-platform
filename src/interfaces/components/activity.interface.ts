import { CSSProperties } from "react";

import { SessionActivity } from "@src/interfaces/models";

export interface ActivityRowProps {
	data: SessionActivity;
	index: number;
	style: CSSProperties;
	setActivity: (activity: SessionActivity) => void;
}
