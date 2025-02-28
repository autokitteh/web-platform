import { z } from "zod";

export const userFeedbackSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().nonempty("Email is required").email("Email is invalid"),
	message: z.string().min(1, "Message is required"),
});
