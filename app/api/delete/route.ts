import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";
import {  collection } from "@/utils/openai";

dotenv.config();

export async function DELETE(request: NextRequest) {
  try {
    const { fileName } = await request.json();
    await collection.deleteMany({ fileName });
    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to delete file" },
      { status: 500 }
    );
  }
}
