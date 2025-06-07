import { NextResponse } from "next/server";

// GET /api/check-trusted?fp=<visitorId>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fp = searchParams.get("fp");
  if (!fp) {
    return NextResponse.json({ error: "Missing fingerprint (fp) parameter" }, { status: 400 });
  }

  // Trusted fingerprints list (comma-separated in env)
  const trustedList = process.env.TRUSTED_FPS || "";
  const trustedArray = trustedList.split(",").map((id) => id.trim()).filter(Boolean);
  const isTrusted = trustedArray.includes(fp);

  return NextResponse.json({ trusted: isTrusted });
}
