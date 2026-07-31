import {
    createContext,
    useContext,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
    theme: Theme
    toggleTheme: () => void
}

const THEME_STORAGE_KEY = "whitebear-theme"
const ThemeContext = createContext<ThemeContextValue | null>(null)

const getInitialTheme = (): Theme => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === "light" || storedTheme === "dark") return storedTheme

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme)
    const transitionTimer = useRef<number | null>(null)

    useLayoutEffect(() => {
        const root = document.documentElement
        root.classList.toggle("dark", theme === "dark")
        root.style.colorScheme = theme
        window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    }, [theme])

    const toggleTheme = () => {
        const root = document.documentElement
        root.classList.add("theme-transitioning")

        if (transitionTimer.current !== null) {
            window.clearTimeout(transitionTimer.current)
        }

        setTheme((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark"
        )

        transitionTimer.current = window.setTimeout(() => {
            root.classList.remove("theme-transitioning")
            transitionTimer.current = null
        }, 240)
    }

    const value = useMemo(
        () => ({
            theme,
            toggleTheme,
        }),
        [theme]
    )

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider")
    }
    return context
}
