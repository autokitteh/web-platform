import { isDevelopment } from "@constants";
import english from "@locales/en";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
	en: english,
};

i18n.use(initReactI18next).init({
	resources,
	fallbackLng: "en",
	debug: isDevelopment,
	interpolation: {
		escapeValue: false,
	},
	react: {
		transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p", "b"],
	},
});

export default i18n;
