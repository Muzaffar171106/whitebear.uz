export interface ClerkUser {
    imageUrl?: string
    firstName?: string
    fullName?: string
    emailAddresses?: Array<{ emailAddress?: string }>
}

export function SignIn() {
    return (
        <div className="h-[calc(100vh-128px)] flex items-center justify-center">
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
                <p className="text-lg font-semibold">Sign in is not available in this Vite build.</p>
                <p className="mt-2 text-sm text-slate-600">Please use your application authentication flow instead.</p>
            </div>
        </div>
    )
}

export function SignUp() {
    return (
        <div className="h-[calc(100vh-128px)] flex items-center justify-center">
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
                <p className="text-lg font-semibold">Sign up is not available in this Vite build.</p>
                <p className="mt-2 text-sm text-slate-600">Please use your application authentication flow instead.</p>
            </div>
        </div>
    )
}

export function useUser(): { isSignedIn: boolean; isLoaded: boolean; user: ClerkUser | null } {
    return { isSignedIn: false, isLoaded: true, user: null }
}

export function useAuth(): { signOut: () => void } {
    return { signOut: () => { } }
}

export function useClerk() {
    return { signOut: () => { } }
}

export function clerkMiddleware<T>(handler: T): T {
    return handler
}

export function createRouteMatcher() {
    return () => false
}
