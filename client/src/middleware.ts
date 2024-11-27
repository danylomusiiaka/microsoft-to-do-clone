import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const token = req.cookies.get("token");

  const staticFileExtensions = [".png", ".jpg", ".jpeg", ".gif", ".css", ".js", ".svg", ".ico"];
  if (staticFileExtensions.some((ext) => url.pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  if (!token && url.pathname !== "/auth") {
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
