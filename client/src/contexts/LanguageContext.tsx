import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language } from "@/utils/i18n";

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
  languages: { code: string; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "te", name: "తెలుగు" },
  { code: "ta", name: "தமிழ்" },
  { code: "ml", name: "മലയാളം" },
  { code: "ur", name: "اردو" },
];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Get browser language or default to English
  const getBrowserLanguage = (): string => {
    const browserLang = navigator.language.split('-')[0];
    return AVAILABLE_LANGUAGES.some(lang => lang.code === browserLang) ? browserLang : "en";
  };
  
  // Get language from localStorage or browser settings
  const getInitialLanguage = (): string => {
    const savedLanguage = localStorage.getItem("sr27_language");
    return savedLanguage || getBrowserLanguage();
  };
  
  const [language, setLanguageState] = useState<string>(getInitialLanguage());
  
  // Update language and save to localStorage
  const setLanguage = (code: string) => {
    if (AVAILABLE_LANGUAGES.some(lang => lang.code === code)) {
      setLanguageState(code);
      localStorage.setItem("sr27_language", code);
      
      // Update document language for accessibility
      document.documentElement.lang = code;
    }
  };
  
  // Set document language on initial load
  useEffect(() => {
    document.documentElement.lang = language;
  }, []);
  
  // Translation function
  const t = (key: string): string => {
    const currentTranslations = translations[language as Language] || translations.en;
    return currentTranslations[key] || translations.en[key] || key;
  };
  
  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        t, 
        languages: AVAILABLE_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
