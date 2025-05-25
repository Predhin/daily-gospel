import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// GET /api/gospel?date=YYYY-MM-DD
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 });
  }
  try {
    const client = await clientPromise;
    const db = client.db("gospel-app");
    const gospel = await db.collection("gospels").findOne({ date });
    if (!gospel) {
      return NextResponse.json({ text: "No gospel for this day." });
    }
    return NextResponse.json({ text: gospel.text });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/gospel { date, text }
export async function POST(request: Request) {
  const body = await request.json();
  if (!body.date || !body.text) {
    return NextResponse.json({ error: "Missing date or text" }, { status: 400 });
  }
  try {
    const client = await clientPromise;
    const db = client.db("gospel-app");
    await db.collection("gospels").updateOne(
      { date: body.date },
      { $set: { text: body.text } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
