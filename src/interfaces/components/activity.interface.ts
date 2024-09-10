import { CSSProperties } from "react";

import { SessionActivity } from "@src/types/models";

export interface ActivityRowProps {
	data: SessionActivity;
	index: number;
	style: CSSProperties;
	setActivity: (activity: SessionActivity) => void;
}
