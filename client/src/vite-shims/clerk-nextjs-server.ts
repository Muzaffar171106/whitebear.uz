export function clerkMiddleware<T>(handler: T): T {
    return handler
}

export function createRouteMatcher() {
    return () => false
}
