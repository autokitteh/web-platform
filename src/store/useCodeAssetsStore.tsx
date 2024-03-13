import { ICodeAssetsStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const store: StateCreator<ICodeAssetsStore> = (set) => ({
	content: "// Code A: Initialize your code here...",
	name: undefined,
	setCodeAsset: (content) => {
		if (typeof content === "string") {
			set({ content });
		} else {
			const reader = new FileReader();
			reader.readAsText(content);
			reader.onload = () => {
				const fileContent = reader.result as string;
				const name = content.name;
				set({ content: fileContent, name });
			};
		}
	},
});

export const useCodeAssetsStore = create(persist(store, { name: "CodeAssetsStore" }));
