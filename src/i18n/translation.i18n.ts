import { english } from "@i18n/en";
import * as i18n from "i18next";

const englishResources = {
	en: {
		translation: english,
	},
};

export const translate = () => {
	if (i18n.hasLoadedNamespace("translation")) {
		return i18n;
	} else {
		i18n.init({
			lng: "en",
			debug: true,
			resources: englishResources,
			fallbackLng: "en",
			ns: ["translation"],
			defaultNS: "translation",
			keySeparator: ".",
		});
		return i18n;
	}
};
