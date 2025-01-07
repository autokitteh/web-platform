import { ResizeDirection } from "@type/hooks";

export interface ResizeHook {
	direction: ResizeDirection;
	initial: number;
	id: string;
	max: number;
	min: number;
	value?: number;
	onChange?: (val: number) => void;
}
