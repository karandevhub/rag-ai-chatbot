import { NextRequest, NextResponse } from "next/server";
import {  collection } from "@/utils/openai";


export async function GET(request: NextRequest) {
  try {
    const documents = await collection
    .aggregate([
      {
        $group: {
          _id: "$url",
          fileName: { $first: "$fileName" },
          type: { $first: "$type" },
          url: { $first: "$url" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$fileName",
          type: "$type",
          url: "$url"
        }
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