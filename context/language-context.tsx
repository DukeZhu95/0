// context/language-context.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useState, useEffect } from "react";

import i18n from "@/lib/i18n";
// import { Alert, I18nManager } from "react-native";
// import * as Updates from "expo-updates";

const LANGUAGE_KEY = "selected_language";

type LanguageContextType = {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: i18n.language,
  setLanguage: () => {},
});

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Load saved language preference
  useEffect(() => {
    (async () => {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
        setCurrentLanguage(savedLanguage);
      }
    })();
  }, []);

  const setLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  // const setLanguage = async (lang: string) => {
  //    const rtlLanguages = ["ar", "he", "fa", "ur"]; // Add more RTL language codes if needed
  //    const isRTL = rtlLanguages.includes(lang);

  //    if (I18nManager.isRTL !== isRTL) {
  // 	   try {
  // 		   await I18nManager.forceRTL(isRTL);
  // 		   await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  // 		   Alert.alert(
  // 			   "Reload Required",
  // 			   "The app needs to reload to apply the language change.",
  // 			   [
  // 				   {
  // 					   text: "Reload",
  // 					   onPress: () => Updates.reloadAsync(),
  // 				   },
  // 			   ]
  // 		   );
  // 	   } catch (error) {
  // 		   console.error("Failed to set RTL:", error);
  // 	   }
  //    } else {
  // 	   await i18n.changeLanguage(lang);
  // 	   setCurrentLanguage(lang);
  // 	   await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  //    }
  // };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
