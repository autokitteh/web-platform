import { LocalDomainHttpService } from "@services/http.service";

export const fetchFileContent = async (fileUrl: string): Promise<string | null> => {
	try {
		const response = await LocalDomainHttpService.get(fileUrl, { responseType: "text" });

		return response.data;
	} catch (error) {
		console.error(`Error fetching file ${fileUrl}:`, error);

		return null;
	}
};
