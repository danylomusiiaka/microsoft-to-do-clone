import Axios from "axios";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { backendUrl } from "./constants/app-config";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const staticFileExtensions = [".png", ".jpg", ".jpeg", ".gif", ".css", ".js", ".svg", ".ico"];
  if (staticFileExtensions.some((ext) => url.pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  if (!token && url.pathname !== "/auth") {
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (token) {
    try {
      const result = await fetch(`${backendUrl}/user/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const date = new Date();
      date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
      if ([401, 500].includes(result.status)) {
        const response = NextResponse.next();
        try {
          const newTokenResponse = await Axios.get(`${backendUrl}/user/refresh`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (newTokenResponse.status === 200) {
            const data = newTokenResponse.data;
            response.cookies.set("token", data.token, {
              sameSite: "lax",
              secure: true,
              expires: date,
            });
          } else {
            response.cookies.delete("token");
            response.cookies.set("session-expired", "true");
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          response.cookies.delete("token");
          response.cookies.set("session-expired", "true");
        }

        return response;
      }

      if (url.pathname === "/auth" || url.pathname === "/server-error") {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    } catch (error) {
      if (url.pathname !== "/server-error") {
        url.pathname = "/server-error";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}
