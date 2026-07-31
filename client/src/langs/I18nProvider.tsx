
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = Cookies.get("locale") || "en";
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [i18n]);

  return <>{children}</>;
}