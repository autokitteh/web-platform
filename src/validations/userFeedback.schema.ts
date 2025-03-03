import { z } from "zod";

export const userFeedbackSchema = z.object({
	message: z
		.string()
		.min(10, "Message must be at least 10 characters")
		.max(200, "Message cannot exceed 200 characters"),
});
