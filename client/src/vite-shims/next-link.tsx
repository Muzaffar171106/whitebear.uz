import { NavLink } from "react-router-dom"
import React from "react"

export interface NextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    legacyBehavior?: boolean
}

export default function Link({ href, children, ...rest }: NextLinkProps) {
    const isHashLink = href.startsWith("#")

    if (isHashLink) {
        return (
            <a href={href} {...rest}>
                {children}
            </a>
        )
    }

    return (
        <NavLink to={href} {...rest}>
            {children}
        </NavLink>
    )
}
