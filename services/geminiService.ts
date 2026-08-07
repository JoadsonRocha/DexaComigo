const AI_ENDPOINT = '/api/ai';

interface AIResponse {
  text?: string;
  category?: string;
  error?: string;
}

const request = async (body: unknown): Promise<AIResponse> => {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data: AIResponse = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro no serviço de IA.');
  return data;
};

export const generateServiceDescription = async (title: string, category: string, keywords: string): Promise<string> => {
  try {
    const data = await request({ task: 'describe', title, category, keywords });
    return data.text || 'Não foi possível gerar a descrição.';
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao gerar descrição. Tente escrever manualmente.";
  }
};

export const suggestCategory = async (title: string): Promise<string> => {
  try {
    const data = await request({ task: 'category', title });
    return data.category || '';
  } catch (e) {
    return "";
  }
};
