import { usePopover, usePopoverList } from "@hooks";

export type PopoverContextType = ReturnType<typeof usePopover> | null;
export type PopoverListContextType = ReturnType<typeof usePopoverList> | null;
