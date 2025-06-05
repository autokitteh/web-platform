import { useCallback } from "react";

import { useModalStore, ModalDataMap } from "@store/useModalStore";
import { ModalName } from "@enums/components";

/**
 * Custom hook to interact with the centralized modal store.
 */
export const useModal = () => {
  const { openModal, closeModal, closeAllModals, getModalData } = useModalStore();
  
  const open = useCallback(
    <T extends keyof ModalDataMap>(name: T, data?: ModalDataMap[T]) => {
      openModal(name, data);
    },
    [openModal]
  );

  const close = useCallback(
    (name: ModalName) => {
      closeModal(name);
    },
    [closeModal]
  );

  return { openModal: open, closeModal: close, closeAllModals, getModalData };
};