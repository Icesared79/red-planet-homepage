import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "rp_unlock";
const COOKIE_VALUE = "ok";

function unlockPage(showError: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Red Planet — Authentication required</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    background: #1a1612;
    color: #f4f0e5;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-font-smoothing: antialiased;
  }
  .box { width: 320px; padding: 0 20px; }
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; font-size: 16px; font-weight: 700; letter-spacing: -0.015em; }
  .dot { width: 9px; height: 9px; background: #d8392f; border-radius: 50%; box-shadow: 0 0 0 4px rgba(216,57,47,0.1); }
  h1 { font-weight: 500; font-size: 14px; color: #b8b0a2; margin-bottom: 16px; letter-spacing: 0.02em; }
  form { display: flex; flex-direction: column; gap: 10px; }
  input {
    padding: 12px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 6px;
    color: #f4f0e5;
    font-size: 14px;
    outline: none;
    font-family: inherit;
    transition: border-color 0.15s;
  }
  input:focus { border-color: #d8392f; }
  button {
    padding: 12px 14px;
    background: #d8392f;
    color: white;
    border: 0;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  button:hover { background: #b82b23; }
  .err { color: #d8392f; font-size: 12px; min-height: 16px; }
</style>
</head>
<body>
<div class="box">
  <div class="brand"><span class="dot"></span>Red Planet</div>
  <h1>Authentication required</h1>
  <form method="POST" action="/api/unlock">
    <input type="password" name="password" autofocus required placeholder="Password" />
    <button type="submit">Enter</button>
    <div class="err">${showError ? "Incorrect password." : ""}</div>
  </form>
</div>
</body>
</html>`;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Always let the unlock endpoint through.
  if (pathname === "/api/unlock") {
    return NextResponse.next();
  }

  // If unlocked, allow through.
  if (request.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE) {
    return NextResponse.next();
  }

  return new NextResponse(unlockPage(searchParams.get("err") === "1"), {
    status: 401,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
