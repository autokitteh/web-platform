import { t } from "i18next";

import { feedbackWebhookUrl, namespaces } from "@constants";
import { UserFeedbackPayload } from "@interfaces/components/userFeedback.interface";
import { HttpJsonService } from "@services/http.service";
import { LoggerService } from "@services/logger.service";
import { ServiceResponse } from "@type";

export class FeedbackService {
	static async sendFeedback(feedback: UserFeedbackPayload): Promise<ServiceResponse<void>> {
		if (!feedbackWebhookUrl) {
			return { data: undefined, error: new Error("Feedback webhook URL is not configured") };
		}
		try {
			await HttpJsonService.post(feedbackWebhookUrl, feedback);
			return { data: undefined, error: undefined };
		} catch (error) {
			const errorMessage = t("errorSendingFeedbackExtended", {
				ns: "errors",
				error: new Error(error).message,
			});
			LoggerService.error(namespaces.feedbackForm, errorMessage);

			return { data: undefined, error: new Error(errorMessage) };
		}
	}
}
