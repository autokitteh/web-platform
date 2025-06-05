import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { ModalName } from "@enums/components";
import { EnrichedEvent } from "@src/types/models";
import { TemplateMetadata } from "@interfaces/store";

/**
 * Define the mapping of modal names to their associated data payloads.
 */
export interface ModalDataMap {
  [ModalName.deleteProject]: { projectId: string; projectName: string };
  [ModalName.deleteMemberFromOrg]: { email: string; id: string; name: string };
  [ModalName.fileViewer]: { filename: string; content: string; language?: string };
  [ModalName.diagramViewer]: { content: string };
  [ModalName.deleteConnection]: { connectionId: string; connectionName: string };
  [ModalName.redispatchEvent]: { eventInfo: EnrichedEvent; activeDeployment?: string };
  [ModalName.duplicateProject]: { originalProjectName: string };
  [ModalName.templateCreateProject]: { template: TemplateMetadata; infoMessage?: string };
  [ModalName.organizationCreated]: { name: string; organizationId: string };
  [ModalName.invitedUser]: { organizationName: string; organizationId: string };
  [ModalName.continueTour]: { name: string; onContinue: () => void; onCancel: () => void };
}

/**
 * Enhanced Zustand store for centralized modal management.
 */
export interface EnhancedModalStore {
  modals: { [key: string]: boolean };
  modalData: Partial<ModalDataMap>;
  openModal: <T extends keyof ModalDataMap>(name: T, data?: ModalDataMap[T]) => void;
  closeModal: (name: keyof ModalDataMap | string) => void;
  closeAllModals: () => void;
  getModalData: <T extends keyof ModalDataMap>(name: T) => ModalDataMap[T] | undefined;
}

const store: StateCreator<EnhancedModalStore> = (set, get) => ({
  modals: {},
  modalData: {},
  openModal: (name, data) =>
    set((state) => ({
      modals: { ...state.modals, [name]: true },
      modalData: { ...state.modalData, [name]: data },
    })),
  closeModal: (name) =>
    set((state) => {
      const newModals = { ...state.modals };
      const newModalData = { ...state.modalData };
      delete newModals[name];
      delete newModalData[name as keyof ModalDataMap];
      return { modals: newModals, modalData: newModalData };
    }),
  closeAllModals: () => set(() => ({ modals: {}, modalData: {} })),
  getModalData: (name) => get().modalData[name],
});

export const useModalStore = create(store, shallow);
