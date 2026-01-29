
import { GoogleGenAI } from "@google/genai";

// Fix: Always use process.env.API_KEY directly and create instance right before generation
export const generateServiceDescription = async (title: string, category: string, keywords: string): Promise<string> => {
    if (!process.env.API_KEY) {
        console.warn("API Key is missing for Gemini");
        return "Configure a API Key para usar a geração automática.";
    }

    try {
        // Correct initialization using named parameter
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            Você é um assistente de marketing especialista em classificados de serviços.
            Escreva uma descrição atraente, profissional e formatada (pode usar markdown leve como tópicos) para um prestador de serviços.
            
            Título do Serviço: ${title}
            Categoria: ${category}
            Palavras-chave/Detalhes extras: ${keywords}
            
            Regras:
            - Use português do Brasil.
            - Máximo de 150 palavras.
            - Foque nos benefícios para o cliente.
            - Inclua uma chamada para ação (CTA) no final.
        `;

        // Use gemini-3-flash-preview for basic text tasks
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        // Use .text property to access extracted string output
        return response.text || "Não foi possível gerar a descrição.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Erro ao gerar descrição. Tente escrever manualmente.";
    }
};

export const suggestCategory = async (title: string): Promise<string> => {
    if (!process.env.API_KEY) return "";

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Use gemini-3-flash-preview for simple classification tasks
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analise o título deste serviço: "${title}". Retorne APENAS o ID da categoria mais provável desta lista (se nenhuma se encaixar, retorne 'outros'):
            home, tech, beauty, education, events, health, transport, cleaning.`,
        });
        // Use .text property to access extracted string output
        return response.text?.trim() || "";
    } catch (e) {
        return "";
    }
};
