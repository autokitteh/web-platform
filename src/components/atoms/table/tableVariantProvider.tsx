import React, { ReactNode, createContext, useContext } from "react";

import { TableVariantContextType } from "@interfaces/components";

const TableVariantContext = createContext<TableVariantContextType>({ variant: "dark" });

// eslint-disable-next-line react-refresh/only-export-components
export const useTableVariant = (): TableVariantContextType => {
	return useContext(TableVariantContext);
};

export const TableVariantProvider = ({
	children,
	variant = "dark",
}: {
	children: ReactNode;
	variant?: "light" | "dark";
}) => {
	return <TableVariantContext.Provider value={{ variant }}>{children}</TableVariantContext.Provider>;
};
