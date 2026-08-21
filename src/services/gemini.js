import { GoogleGenerativeAI } from "@google/generative-ai";

const STORAGE_KEY = 'dexpdf_gemini_api_key';

export const getStoredApiKey = () => {
    if (typeof window === 'undefined') return null;
    const legacyKey = localStorage.getItem(STORAGE_KEY);
    if (legacyKey) {
        sessionStorage.setItem(STORAGE_KEY, legacyKey);
        localStorage.removeItem(STORAGE_KEY);
    }
    return sessionStorage.getItem(STORAGE_KEY);
};

export const setStoredApiKey = (key) => {
    if (typeof window === 'undefined') return;
    if (key) sessionStorage.setItem(STORAGE_KEY, key);
    else sessionStorage.removeItem(STORAGE_KEY);
};

export const removeStoredApiKey = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
};

export const initializeGemini = (apiKey) => {
    if (!apiKey) throw new Error("API Key is required");
    return new GoogleGenerativeAI(apiKey);
};

// Strict BYOK: requests go directly from the browser to Google with the
// user's own key. No server proxy — document text never touches our backend.
export const generateContent = async (apiKey, prompt, modelName = "gemini-2.5-flash") => {
    if (!apiKey) throw new Error("API Key is required");

    try {
        const genAI = initializeGemini(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

export const generateJSON = async (apiKey, prompt, modelName = "gemini-2.5-flash") => {
    if (!apiKey) throw new Error("API Key is required");

    try {
        const genAI = initializeGemini(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error("Gemini API JSON Error:", error);
        throw error;
    }
};
