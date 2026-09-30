import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeImage(
  imageBase64: string,
  mimeType: string
) {
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",

    input: [
      {
        type: "image",
        mime_type: mimeType,
        data: imageBase64,
      },
      {
        type: "text",
        text: `
You are the AI assistant for Vintage Magic, a vintage and second-hand fashion brand.

Analyze the uploaded item and determine whether it is realistically suitable for textile/fashion upcycling.

Analyze:

1. What the item appears to be.
2. Its likely material.
3. Its main colors.
4. Important visible features.
5. Up to 3 realistic ways the item could potentially be upcycled.

IMPORTANT RULES:

- Do NOT force recommendations.
- If the item is not realistically suitable for upcycling, return an empty recommendations array.
- Only recommend transformations that could reasonably be made from the visible material and structure.
- Do not invent materials or features that cannot reasonably be determined from the image.
- If information is uncertain, say so.
- Recommendations should be practical and creative.
- Prefer fashion, accessories, and useful textile products.

Return ONLY valid JSON using this exact structure:

{
  "item_type": "string",
  "material": "string",
  "colors": ["string"],
  "visible_features": ["string"],
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "reason": "string"
    }
  ]
}

The recommendations array may contain 0, 1, 2, or 3 items.
`,
      },
    ],
  });

  return interaction.output_text;
}