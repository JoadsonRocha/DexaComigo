const MODEL = 'gemini-3-flash-preview';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Chave da API Gemini não configurada no servidor (Vercel Env: GEMINI_API_KEY).' });
    return;
  }

  let body;
  try {
    body = JSON.parse(req.body || '{}');
  } catch {
    res.status(400).json({ error: 'JSON inválido' });
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  let prompt = '';
  if (body.task === 'category') {
    const title = String(body.title || '').trim();
    if (!title) {
      res.status(400).json({ error: 'Título é obrigatório' });
      return;
    }
    prompt = `Analise o título deste serviço: "${title}". Retorne APENAS o ID da categoria mais provável desta lista (se nenhuma se encaixar, retorne 'outros'): hair, nails, makeup, eyebrows, hair-removal, facial, body.`;
  } else {
    const title = String(body.title || '').trim();
    const category = String(body.category || '').trim();
    const keywords = String(body.keywords || '').trim();
    if (!title) {
      res.status(400).json({ error: 'Título é obrigatório' });
      return;
    }
    prompt = `Você é um assistente de marketing especialista em classificados de serviços.
Escreva uma descrição atraente, profissional e formatada (pode usar markdown leve como tópicos) para um prestador de serviços.

Título do Serviço: ${title}
Categoria: ${category}
Palavras-chave/Detalhes extras: ${keywords}

Regras:
- Use português do Brasil.
- Máximo de 150 palavras.
- Foque nos benefícios para o cliente.
- Inclua uma chamada para ação (CTA) no final.`;
  }

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    });

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!r.ok || text === undefined) {
      console.error('Gemini API error:', r.status, data?.error || data);
      res.status(r.ok ? 500 : 502).json({ error: 'Erro ao gerar conteúdo com IA.' });
      return;
    }

    if (body.task === 'category') {
      res.status(200).json({ category: text.trim() });
    } else {
      res.status(200).json({ text });
    }
  } catch (e) {
    console.error('Gemini fetch error:', e);
    res.status(500).json({ error: 'Erro ao conectar com o serviço de IA.' });
  }
}
