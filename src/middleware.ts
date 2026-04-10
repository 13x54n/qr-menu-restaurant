import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getSubdomain } from "@/lib/subdomain";

/**
 * Edge middleware stays small: do not import `@/auth` here — that pulls NextAuth + providers
 * (and can drag Prisma) past the 1 MB Vercel Edge limit. Session checks use `getToken` only.
 */
export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const subdomain = getSubdomain(host);

  if (subdomain) {
    const url = request.nextUrl.clone();
    url.pathname = `/menu/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const useSecureCookies = request.nextUrl.protocol === "https:";
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
      secureCookie: useSecureCookies,
    });
    if (!token) {
      const login = new URL("/login", request.nextUrl.origin);
      login.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
