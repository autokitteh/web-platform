import { IProjectStore } from "@interfaces/store";
import { ProjectsService } from "@services";
import { debounce } from "lodash";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const readFileAsUint8Array = (file: File): Promise<Uint8Array> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
		reader.onerror = () => reject(reader.error);

		reader.readAsArrayBuffer(file);
	});
};

const debouncedUpdateContent = debounce((set, activeFile, content) => {
	const contentUintArray = new TextEncoder().encode(content);

	set((state: IProjectStore) => ({
		...state,
		resources: {
			...state.resources,
			[activeFile as string]: contentUintArray,
		},
	}));
}, 1000);

const defaultState: Omit<IProjectStore, "setUpdateContent" | "setProjectResources" | "resetContent"> = {
	resources: undefined,
	projectId: undefined,
	activeFile: undefined,
	projectUpdateCount: 0,
};

const store: StateCreator<IProjectStore> = (set, get) => ({
	...defaultState,
	setUpdateContent: (content) => {
		if (!content) {
			set((state) => ({ ...state, projectUpdateCount: state.projectUpdateCount + 1 }));
			return;
		}

		if (!get().activeFile) return;

		debouncedUpdateContent(set, get().activeFile, content);
	},
	setProjectResources: async (file, projectId) => {
		const fileContent = typeof file === "string" ? new Uint8Array() : await readFileAsUint8Array(file);
		const name = typeof file === "string" ? file : file.name;

		const { error } = await ProjectsService.setResources(projectId, {
			[name]: fileContent,
		});

		set((state) => ({
			...state,
			projectId,
			activeFile: name,
			resources: {
				...(state.projectId !== projectId ? {} : state.resources),
				[name]: fileContent,
			},
		}));

		return { error };
	},
	resetContent: async () => set(() => defaultState),
});

export const useProjectStore = create(persist(store, { name: "ProjectStore" }));
