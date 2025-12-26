'use client'
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import id from './locales/id.json';

const i18nInstance = i18n.use(initReactI18next);

// Only use browser language detector on client side
if (typeof window !== 'undefined') {
    i18nInstance.use(LanguageDetector);
}

i18nInstance.init({
    resources: {
        en: { translation: en },
        id: { translation: id }
    },
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    },
    detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
        caches: ['localStorage', 'cookie']
    }
});

export default i18n;
