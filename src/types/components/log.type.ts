export type ToasterTypes = "error" | "info" | "success" | "warning";
export type LogType = Extract<ToasterTypes, "error" | "warning">;
