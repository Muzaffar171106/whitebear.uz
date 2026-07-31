
import { useEffect, useState } from "react";
import { LangProvider } from "./lang";

export const LangLayout = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <img src="/loading.svg" alt="Logo" width={250} height={200} />
      </div>
    );

  return (
    <LangProvider onLangChange={setLang}>
      <div lang={lang}>{children}</div>
    </LangProvider>
  );
};
