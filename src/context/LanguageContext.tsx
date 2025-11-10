import type { PropsWithChildren } from 'react';
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import ar from '~/lang/ar';
import en from '~/lang/en';

type Lang = 'en' | 'ar';
type Strings = typeof en;

const translations: Record<Lang, Strings> = { en, ar };
const defaultLang: Lang = 'en';

type LanguageContextValue = {
    language: Lang;
    setLanguage: (l: Lang) => void;
    toggleLanguage: () => void;
    strings: Strings;
};

export const LanguageContext = createContext<LanguageContextValue>({
    language: defaultLang,
    setLanguage: () => { },
    toggleLanguage: () => { },
    strings: translations[defaultLang],
});

export const LanguageProvider = ({ children }: PropsWithChildren) => {
    const [language, setLanguageState] = useState<Lang>(() => {
        try {
            const ls = localStorage.getItem('lang');
            if (ls === 'ar' || ls === 'en') return ls;
        } catch { }
        return defaultLang;
    });

    useEffect(() => {
        try {
            localStorage.setItem('lang', language);
        } catch { }
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.classList.toggle('rtl', language === 'ar');
    }, [language]);

    const setLanguage = (l: Lang) => setLanguageState(l);
    const toggleLanguage = () => setLanguageState((s) => (s === 'en' ? 'ar' : 'en'));

    const value: LanguageContextValue = {
        language,
        setLanguage,
        toggleLanguage,
        strings: translations[language],
    };

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// ✅ Correct hook for consuming context
export const useLanguage = () => useContext(LanguageContext);
