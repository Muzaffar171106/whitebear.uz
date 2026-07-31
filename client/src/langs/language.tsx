import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

export const LanguageSelect = () => {
  const { i18n } = useTranslation("common");
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const storedLang = Cookies.get("locale") || "en";
    setLang(storedLang);
    i18n.changeLanguage(storedLang);
  }, [i18n]);

  const changeLanguage = (selectedLang: string) => {
    setLang(selectedLang);
    i18n.changeLanguage(selectedLang);
    Cookies.set("locale", selectedLang, { expires: 365 });
  };

  return (
    <Select value={lang} onValueChange={changeLanguage}>
      <SelectTrigger className="w-22 border-transparent bg-white text-xs text-[#102a43] dark:border-white/15 dark:bg-[#102230] dark:text-white">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent className="min-w-20 border-slate-200 bg-white text-[#102a43] dark:border-white/10 dark:bg-[#102230] dark:text-white">
        <SelectItem value="en">
          <img
            src="/flags/en.svg"
            alt="English"
            width={20}
            height={14} />
          EN
        </SelectItem>
        <SelectItem value="uz">
          <img
            src="/flags/uz.svg"
            alt="Uzbek"
            width={20}
            height={14} />
          UZ
        </SelectItem>
        <SelectItem value="ru">
          <img
            src="/flags/ru.svg"
            alt="Russian"
            width={20}
            height={14} />
          RU
        </SelectItem>
        <SelectItem value="ch">
          <img
            src="/flags/ch.svg"
            alt="Chinese"
            width={20}
            height={14} />
          CH
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
