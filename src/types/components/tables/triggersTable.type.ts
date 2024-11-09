import { Trigger } from "@src/types/models";

export type SortableColumns = keyof Pick<Trigger, "name" | "sourceType" | "entrypoint">;
