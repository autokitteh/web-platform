export const convertPythonStringToJSON = (input: string): any => {
	try {
		let trimmedString = input.trim();
		if (trimmedString.startsWith('`"') && trimmedString.endsWith('"`')) {
			trimmedString = trimmedString.slice(2, -2);
		} else if (trimmedString.startsWith('"') && trimmedString.endsWith('"')) {
			trimmedString = trimmedString.slice(1, -1);
		}

		const jsonString = trimmedString.replace(/'/g, '"');
		if (jsonString.startsWith("{") && jsonString.endsWith("}")) {
			return JSON.parse(jsonString);
		}

		return jsonString;
	} catch (error) {
		console.error("Error converting Python dict to JSON:", error);

		return null;
	}
};
