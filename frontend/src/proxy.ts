// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (
        pathname.startsWith("/chat") ||
        pathname === "/profile"
    ) {
        const refreshToken = req.cookies.get("refreshToken")?.value;
        if (!refreshToken) {
            const url = req.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/chat/:path*", "/profile"]
};
