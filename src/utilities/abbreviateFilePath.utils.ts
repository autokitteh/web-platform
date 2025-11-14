export const abbreviateFilePath = (filePath: string, maxLength = 30): string => {
	if (filePath.length <= maxLength) {
		return filePath;
	}

	const parts = filePath.split("/");

	if (parts.length <= 2) {
		return filePath;
	}

	const fileName = parts[parts.length - 1];
	const firstDir = parts[0];

	if (firstDir.length + fileName.length + 4 > maxLength) {
		const availableLength = maxLength - 7;
		const truncatedFileName = fileName.substring(0, availableLength) + "...";
		return `${firstDir}/.../${truncatedFileName}`;
	}

	return `${firstDir}/.../${fileName}`;
};
