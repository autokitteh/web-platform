import { unique } from "radash";

export const updateOpenedFilesState = (files: { isActive: boolean; name: string }[], name: string) => {
	return unique(
		[...files.map((file) => ({ ...file, isActive: file.name === name })), { isActive: true, name }],
		(f) => f.name
	);
};
