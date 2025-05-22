import { ToasterTypes } from "@src/types/components/toasterTypes.type";

export type LogType = Extract<ToasterTypes, "error" | "warning">;
