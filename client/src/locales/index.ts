import en from './en/translation.json';
import az from './az/translation.json';

// To add a new language:
// 1. Create a folder (e.g. 'ru') and adding translation.json
// 2. Import it here
// 3. Add to the resources object below

export const resources = {
    en: { translation: en },
    az: { translation: az },
};

export const languages = [
    { code: "en", label: "English" },
    { code: "az", label: "Azerbaijani" }
];
