
import "@/i18n";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import I18nProvider from "./I18nProvider";

export const LangProvider = ({
  children,
  onLangChange,
}: {
  children: React.ReactNode;
  onLangChange?: (lang: string) => void;
}) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const lang = Cookies.get("locale") || "en";
    i18n.changeLanguage(lang);
    setLang(lang);
    onLangChange?.(lang);
  }, [i18n, onLangChange]);

  return (
    <I18nProvider>
      <div lang={lang}>{children}</div>
    </I18nProvider>
  );

};


