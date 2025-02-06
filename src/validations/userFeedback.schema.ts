import { z } from "zod";

export const userFeedbackSchema = z.object({
	message: z.string().min(1, "Message is required"),
});
