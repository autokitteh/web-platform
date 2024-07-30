import { SelfRequestsService } from "@services/http.service";

export const fetchFileContent = async (fileUrl: string): Promise<string | null> => {
	try {
		const response = await SelfRequestsService.get(fileUrl, { responseType: "text" });

		return response.data;
	} catch (error) {
		console.error(`Error fetching file ${fileUrl}:`, error);

		return null;
	}
};

export const fetchAllFilesContent = async (
	folderUrl: string,
	filesOfProject: string[]
): Promise<Record<string, Uint8Array>> => {
	const filesContent: Record<string, Uint8Array> = {};
	const nonYamlFiles = filesOfProject.filter((fileName) => !fileName.endsWith(".yaml"));

	for (const fileName of nonYamlFiles) {
		const fileUrl = `${folderUrl}${fileName}`;
		const content = await fetchFileContent(fileUrl);
		if (content) {
			filesContent[fileName] = new TextEncoder().encode(content);
		}
	}

	return filesContent;
};
