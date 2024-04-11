import { map, uniqBy } from "lodash";

export const updateOpenedFilesState = (files: { name: string; isActive: boolean }[], name: string) => {
	return uniqBy(
		[...map(files, (file) => ({ ...file, isActive: file.name === name })), { name, isActive: true }],
		"name"
	);
};
