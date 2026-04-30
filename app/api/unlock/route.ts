import { NextResponse } from "next/server";

const SITE_PASSWORD =
  process.env.SITE_PASS ?? process.env.SITE_PASSWORD ?? "redplanet2026";
const COOKIE_NAME = "rp_unlock";
const COOKIE_VALUE = "ok";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const data = await request.formData();
  const submitted = data.get("password");
  const origin = new URL(request.url).origin;

  if (typeof submitted === "string" && submitted === SITE_PASSWORD) {
    const res = NextResponse.redirect(`${origin}/`, 303);
    res.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return res;
  }

  return NextResponse.redirect(`${origin}/?err=1`, 303);
}
