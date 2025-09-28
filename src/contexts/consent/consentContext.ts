import { createContext } from "react";

import type { ConsentContext as ConsentContextType } from "@src/types/consent.type";

export const ConsentContext = createContext<ConsentContextType | null>(null);
