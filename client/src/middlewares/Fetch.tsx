import axios, { type InternalAxiosRequestConfig } from "axios"
import Cookie from "js-cookie"
export const Fetch = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30_000,
})

Fetch.interceptors.request.use((config: InternalAxiosRequestConfig) => {

    if (typeof window !== "undefined") {

        const token = Cookie.get("token")

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }

    return config
})
