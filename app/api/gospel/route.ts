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
    return NextResponse.json(gospel);
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/gospel { date, text, imageData }
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const date = formData.get("date") as string;
    const text = formData.get("text") as string;
    const image = formData.get("image") as File | null;

    if (!date) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    if (!text && !image) {
      return NextResponse.json({ error: "Missing both text and image" }, { status: 400 });
    }

    let imageData = null;
    if (image) {
      const bytes = await image.arrayBuffer();
      imageData = Buffer.from(bytes).toString('base64');
    }

    const client = await clientPromise;
    const db = client.db("gospel-app");
    
    await db.collection("gospels").updateOne(
      { date },
      { 
        $set: { 
          text: text || null,
          imageData: imageData || null,
          contentType: image ? image.type : null
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
