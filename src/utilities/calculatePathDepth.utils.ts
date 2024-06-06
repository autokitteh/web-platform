export const calculatePathDepth = (path: string) => {
	return path.split("/").filter(Boolean).length;
};
