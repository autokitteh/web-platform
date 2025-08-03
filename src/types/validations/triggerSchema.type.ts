import { z } from "zod";

import { triggerSchema } from "@validations/trigger.schema";

export type TriggerFormData = z.infer<typeof triggerSchema>;
