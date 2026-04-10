import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSubdomain } from "@/lib/subdomain";

export default auth((req) => {
  const host = req.headers.get("host");
  const subdomain = getSubdomain(host);

  if (subdomain) {
    const url = req.nextUrl.clone();
    url.pathname = `/menu/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  if (req.nextUrl.pathname.startsWith("/dashboard") && !req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
