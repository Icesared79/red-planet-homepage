import { NextResponse } from "next/server";
import { getAtlasLive } from "@/lib/atlas-live";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  try {
    const data = await getAtlasLive();
    return NextResponse.json(data, {
      headers: { "cache-control": "public, max-age=300" },
    });
  } catch (err) {
    console.error("/api/atlas-live error:", err);
    return NextResponse.json(
      { error: "Live data temporarily unavailable." },
      { status: 503 }
    );
  }
}
