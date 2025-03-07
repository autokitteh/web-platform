import * as i18n from "i18next";
import { initReactI18next } from "react-i18next";

import english from "@locales/en";

const resources = {
	en: english,
};

i18n.use(initReactI18next).init({
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
	react: {
		transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p", "b"],
	},
	resources,
});

export default i18n;
