export const getShortId = (id: string, suffixLength: number) => {
	if (!id?.length) return "";
	const idPrefix = id.split("_")[0];
	const idSuffix = id.split("_")[1];
	const isValidId = idPrefix?.length > 0 && idSuffix?.length >= suffixLength;
	if (!isValidId) return "";
	const idSuffixEnd = idSuffix.substring(idSuffix.length - suffixLength, idSuffix.length);
	return `${idPrefix}...${idSuffixEnd}`;
};
