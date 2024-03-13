export interface IMenuStore {
	projectId?: string;
	projectUpdateCount: number;
	updateProject: (id: string) => void;
}
