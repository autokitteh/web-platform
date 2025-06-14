import { t } from "i18next";

import { namespaces } from "@src/constants";
import { TourId } from "@src/enums/tour.enum";
import { tourStorage, LoggerService } from "@src/services";

export const validateAllRequiredToursExist = async (): Promise<boolean> => {
	try {
		const localStorageTours = await tourStorage.getAllRecords();

		if (!localStorageTours || localStorageTours.length === 0) {
			return false;
		}

		const requiredTourIds = Object.values(TourId);
		const existingTourIds = localStorageTours.map((tour) => tour.projectId);
		const allToursExist = requiredTourIds.every((tourId) => existingTourIds.includes(tourId));

		return allToursExist;
	} catch (error) {
		LoggerService.error(
			namespaces.utilities.toursUtilities,
			t("tours.validationError", {
				error: (error as Error).message,
				ns: "utilities",
			})
		);
		return false;
	}
};
