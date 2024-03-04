import english from "@locales/en";
import hebrew from "@locales/he";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const resources = {
	en: english,
	he: hebrew,
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "en",
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ["querystring", "cookie", "localStorage", "navigator"],
			caches: ["localStorage", "cookie"],
		},
	});

export default i18n;
