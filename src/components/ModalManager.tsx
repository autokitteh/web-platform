import React from "react";

import { modalRegistry, ModalConfig } from "./modalRegistry";
import { useModalStore } from "@store/useModalStore";
import { ModalName } from "@enums/components";

/**
 * Renders all currently open modals based on the centralized modal registry and store.
 */
export const ModalManager: React.FC = () => {
  const { modals, getModalData } = useModalStore();
  return (
    <>
      {Object.entries(modals).map(([modalName, isOpen]) => {
        if (!isOpen) return null;
        const modalConfig = modalRegistry[modalName as ModalName];
        if (!modalConfig) return null;
        const { component: ModalComponent, requiresData } = modalConfig as ModalConfig;
        const data = getModalData(modalName as ModalName);
        if (requiresData && !data) return null;
        return (
          <ModalComponent
            key={modalName}
            data={data}
            {...(data as object)}
          />
        );
      })}
    </>
  );
};