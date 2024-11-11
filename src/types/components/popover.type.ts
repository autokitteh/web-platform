import { usePopover } from "@src/hooks";

export type PopopverContextType =
	| (ReturnType<typeof usePopover> & {
			setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
			setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
	  })
	| null;
