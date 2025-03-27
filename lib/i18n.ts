// lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "@/locales/ar.json";
import bn from "@/locales/bn.json";
import cs from "@/locales/cs.json";
import da from "@/locales/da.json";
import de from "@/locales/de.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import ha from "@/locales/ha.json";
import hi from "@/locales/hi.json";
import it from "@/locales/it.json";
import ja from "@/locales/ja.json";
import ko from "@/locales/ko.json";
import nl from "@/locales/nl.json";
import pl from "@/locales/pl.json";
import pt from "@/locales/pt.json";
import ru from "@/locales/ru.json";
import sv from "@/locales/sv.json";
import sw from "@/locales/sw.json";
import tr from "@/locales/tr.json";
import uk from "@/locales/uk.json";
import vi from "@/locales/vi.json";
import zh from "@/locales/zh.json";
import ln from "@/locales/ln.json";
import kg from "@/locales/kg.json";
import lu from "@/locales/lu.json";
import yo from "@/locales/yo.json";
import ig from "@/locales/ig.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  pt: { translation: pt },
  de: { translation: de },
  it: { translation: it },
  ru: { translation: ru },
  ja: { translation: ja },
  zh: { translation: zh },
  ar: { translation: ar },
  ko: { translation: ko },
  hi: { translation: hi },
  tr: { translation: tr },
  vi: { translation: vi },
  bn: { translation: bn },
  sw: { translation: sw },
  pl: { translation: pl },
  uk: { translation: uk },
  cs: { translation: cs },
  nl: { translation: nl },
  sv: { translation: sv },
  da: { translation: da },
  ha: { translation: ha },
  ln: { translation: ln },
  kg: { translation: kg },
  lu: { translation: lu },
  yo: { translation: yo },
  ig: { translation: ig },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
