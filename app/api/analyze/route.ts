import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { image, mimeType } = body;

    if (!image || !mimeType) {
      return NextResponse.json(
        {
          success: false,
          error: "Image is required",
        },
        { status: 400 },
      );
    }

    const result = await analyzeImage(image, mimeType);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);
    console.error("===================================");

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
