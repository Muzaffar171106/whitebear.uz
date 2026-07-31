export type SupportedLanguage = "en" | "uz" | "ru" | "ch"

export function resolveLanguage(language: string): SupportedLanguage {
    const baseLanguage = language.toLowerCase().split("-")[0]

    if (baseLanguage === "uz" || baseLanguage === "ru") return baseLanguage
    if (baseLanguage === "ch" || baseLanguage === "zh") return "ch"
    return "en"
}
