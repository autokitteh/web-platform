import { SessionActivity } from "@src/interfaces/models";

export interface ActivityRowProps {
	data: SessionActivity;
	index: number;
	setActivity: (activity: SessionActivity) => void;
}
