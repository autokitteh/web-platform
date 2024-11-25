import { usePopover, usePopoverList } from "@src/hooks";

export type PopopverContextType = ReturnType<typeof usePopover> | null;
export type PopopverListContextType = ReturnType<typeof usePopoverList> | null;
