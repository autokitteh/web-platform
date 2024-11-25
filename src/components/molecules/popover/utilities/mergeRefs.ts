import { useMergeRefs } from "@floating-ui/react";

export const useMergeRefsCustom = (...refs: any[]) => {
	return useMergeRefs(refs.filter(Boolean));
};
