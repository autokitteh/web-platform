import { map, uniqBy } from "lodash";

export const updateOpenedFilesState = (files: { isActive: boolean; name: string }[], name: string) => {
	return uniqBy([...map(files, (file) => ({ ...file, isActive: file.name === name })), { isActive: true, name }], "name");
};
