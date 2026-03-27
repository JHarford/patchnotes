import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabase";

let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });
  }
  return _ai;
}

export async function generateImage(
  prompt: string,
  aspectRatio: string = "16:9"
): Promise<string | null> {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio,
        },
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      console.error("No parts in Gemini response");
      return null;
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data!, "base64");
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

        const { error } = await supabase.storage
          .from("newsletter-images")
          .upload(filename, buffer, {
            contentType: "image/png",
            upsert: false,
          });

        if (error) {
          console.error("Failed to upload image:", error.message);
          return null;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("newsletter-images")
          .getPublicUrl(filename);

        return publicUrl;
      }
    }

    return null;
  } catch (err) {
    console.error("Image generation failed:", err);
    return null;
  }
}

export async function generateHeaderImage(
  title: string,
  leadStory: string
): Promise<string | null> {
  console.log("Generating header image themed by lead story...");

  const prompt = `Create a stylised, abstract digital illustration inspired by this video game industry headline: "${leadStory}".

Style: Bold, graphic, abstract. Think editorial illustration meets concept art. Dark background (#0a0a0f), vibrant accent colours (electric indigo, neon cyan, hot magenta). Geometric shapes, light trails, silhouettes. Moody and atmospheric.

Do NOT include any text, words, letters, or logos in the image. Pure visual art only.`;

  return generateImage(prompt, "3:2");
}
