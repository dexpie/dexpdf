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

// Try server-side proxy first, then fall back to client-side key
export const generateContent = async (apiKey, prompt, modelName = "gemini-2.5-flash") => {
    // 1. Try Server Proxy (if no specific apiKey provided or if we want to prefer server)
    // We prefer server if apiKey is empty/null, OR we can try server first always.
    // Strategy: Try server. If 401/429, check if we have client apiKey.

    try {
        if (!apiKey) {
            const serverRes = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, modelName, jsonMode: false })
            });

            if (serverRes.ok) {
                const data = await serverRes.json();
                return data.output;
            }
            // If server fails (401 no key, 429 quota), throw to trigger fallback
            if (serverRes.status === 401 || serverRes.status === 429) {
                throw new Error("SERVER_KEY_UNAVAILABLE");
            }
        }
    } catch (err) {
        if (err.message !== "SERVER_KEY_UNAVAILABLE") console.warn("Server proxy failed, trying client key...", err);
    }

    // 2. Client Fallback (BYOK)
    if (!apiKey) throw new Error("API Key is required"); // Re-throw if no client key either

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
    // 1. Try Server Proxy
    try {
        if (!apiKey) {
            const serverRes = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, modelName, jsonMode: true })
            });

            if (serverRes.ok) {
                const data = await serverRes.json();
                return JSON.parse(data.output);
            }
            if (serverRes.status === 401 || serverRes.status === 429) {
                throw new Error("SERVER_KEY_UNAVAILABLE");
            }
        }
    } catch (err) {
        if (err.message !== "SERVER_KEY_UNAVAILABLE") console.warn("Server proxy JSON failed, trying client key...", err);
    }

    // 2. Client Fallback
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
