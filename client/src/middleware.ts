import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const token = req.cookies.get("token");

  try {
    const result = await fetch(`${webUrl}/user/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (result.ok) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    if (url.pathname === "/server-error") {
      return NextResponse.next();
    }
    url.pathname = "/server-error";
    return NextResponse.redirect(url);
  }

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
