import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import mr from './locales/mr.json';
import hi from './locales/hi.json';
import gu from './locales/gu.json';

export const PRIMARY_LANGUAGES = ['en', 'mr', 'hi', 'gu'] as const;

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, mr: { translation: mr }, hi: { translation: hi }, gu: { translation: gu } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
