import axios from "axios";

const fetchFileContent = async (fileUrl: string): Promise<string | null> => {
	try {
		const response = await axios.get(fileUrl, { responseType: "text" });

		return response.data;
	} catch (error) {
		console.error(`Error fetching file ${fileUrl}:`, error);

		return null;
	}
};

export const fetchAllFilesContent = async (
	baseUrl: string,
	filesOfProject: string[]
): Promise<Record<string, Uint8Array>> => {
	const filesContent: Record<string, Uint8Array> = {};

	// Filter the files to exclude .yaml files
	const nonYamlFiles = filesOfProject.filter((fileName) => !fileName.endsWith(".yaml"));

	for (const fileName of nonYamlFiles) {
		const fileUrl = `${baseUrl}${fileName}`;
		const content = await fetchFileContent(fileUrl);
		if (content) {
			filesContent[fileName] = new TextEncoder().encode(content);
		}
	}

	return filesContent;
};
