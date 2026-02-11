import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "Server API Key not configured" },
                { status: 401 } // 401 signals client to ask user for key
            );
        }

        const body = await req.json();
        const { prompt, jsonMode = false, modelName = "gemini-1.5-flash" } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ output: text });

    } catch (error) {
        console.error("Gemini Server API Error:", error);

        // If quota exceeded (429) or other API issues, return 429 to trigger fallback
        if (error.status === 429 || error.message?.includes('429')) {
            return NextResponse.json({ error: "Server Quota Exceeded" }, { status: 429 });
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
