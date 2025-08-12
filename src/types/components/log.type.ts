import { ToasterTypes } from "@src/types/components/toasterTypes.type";

export type { ToasterTypes };
export type LogType = Extract<ToasterTypes, "error" | "warning">;
