import { tourSteps } from "@constants/tour.constants";

export type TourStepKeys = keyof typeof tourSteps;
export type TourStepValues<T extends TourStepKeys> = T extends TourStepKeys
	? (typeof tourSteps)[T][keyof (typeof tourSteps)[T]]
	: never;
export type IndexedDBTourType = {
	files: Record<string, { content: string; name: string }>[];
	projectId: string;
};
