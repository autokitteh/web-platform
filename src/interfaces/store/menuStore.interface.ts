export interface IMenuStore {
	newProjectId: string | undefined;
	updateNewProjectId: (id: string) => void;
}
