type TestIdComponents = "projectDeleteModal";
export const getTestIdFromText = (prefix: string, message: string): string =>
	`${prefix}-${message.toLowerCase().replace(/ /g, "-")}`;

export const getTestId: Record<TestIdComponents, (...args: string[]) => string> = {
	projectDeleteModal: (projectName) => getTestIdFromText("modal", `${projectName} delete project modal`),
};
