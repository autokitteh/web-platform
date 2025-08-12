import { ToasterTypes } from "./log.type";

export type MetadataResult = {
	handled: boolean;
	message?: string;
	type?: ToasterTypes;
};

export type ProjectActionType = "build" | "deploy" | "manualRun";
