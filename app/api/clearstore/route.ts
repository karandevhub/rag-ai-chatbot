import { NextRequest, NextResponse } from "next/server";
import { collection, inMemoryVectorStore } from "@/utils/openai";

export async function GET(request: NextRequest) {
  try {
    await inMemoryVectorStore();
    return NextResponse.json({ message: "store cleared" });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch files" },
      { status: 500 }
    );
  } finally {
  }
}
