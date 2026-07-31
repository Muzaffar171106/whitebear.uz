import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/theme/theme-provider"

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === "dark"
    const label = isDark ? "Switch to light mode" : "Switch to dark mode"

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={label}
            title={label}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white transition hover:border-[#f78a32] hover:bg-white/10 hover:text-[#f78a32]"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    )
}
