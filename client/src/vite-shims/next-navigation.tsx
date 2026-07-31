import { useLocation, useParams as useRouterParams } from "react-router-dom"

export function usePathname() {
    const location = useLocation()
    return location.pathname
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
    return useRouterParams<T>()
}
