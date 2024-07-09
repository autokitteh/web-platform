import { ResizeDirection } from "@type/hooks";

export interface ResizeHook {
	direction: ResizeDirection;
	initial?: number;
	max: number;
	min: number;
}
