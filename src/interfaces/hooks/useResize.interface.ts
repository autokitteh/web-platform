import { ResizeDirection } from "@type/hooks";

export interface ResizeHook {
	min: number;
	max: number;
	initial?: number;
	direction: ResizeDirection;
}
