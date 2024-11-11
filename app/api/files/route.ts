import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";
import { client, collection } from "@/utils/openai";

dotenv.config();

export async function GET(request: NextRequest) {
  try {
    const documents = await collection
      .aggregate([
        {
          $group: {
            _id: {
              fileName: "$fileName",
              type: "$type",
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            name: "$_id.fileName",
            type: "$_id.type",
            _id: 0,
          },
        },
      ])
      .toArray();

    return NextResponse.json(documents);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch files" },
      { status: 500 }
    );
  } finally {
   
  }
}