import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Protect these routes (client side will also enforce)
    if (pathname.startsWith("/chat") || pathname.startsWith("/profile")) {
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
