import { Integrations } from "@enums/components";

export type IntegrationType = keyof typeof Integrations;

export type TriggerType = "default" | "scheduled";
