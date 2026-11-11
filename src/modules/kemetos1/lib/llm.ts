// Kemetos1 Coordinator — minimal API-key LLM client.
//
// Reads VITE_KEMETOS1_LLM_API_KEY / VITE_KEMETOS1_LLM_BASE_URL /
// VITE_KEMETOS1_LLM_MODEL from env and POSTs to an OpenAI-compatible
// /chat/completions endpoint. When no API key / base URL is configured the
// caller degrades to local heuristics so the prototype still runs end-to-end
// without credentials.

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMConfig {
  apiKey: string | undefined;
  baseUrl: string | undefined;
  model: string;
  temperature: number;
  maxTokens: number;
}

function readEnv(): LLMConfig {
  return {
    apiKey: import.meta.env.VITE_KEMETOS1_LLM_API_KEY,
    baseUrl: import.meta.env.VITE_KEMETOS1_LLM_BASE_URL,
    model: import.meta.env.VITE_KEMETOS1_LLM_MODEL || 'kemetos1-coordinator',
    temperature: 0.3,
    maxTokens: 600,
  };
}

export function isLLMConfigured(): boolean {
  const { apiKey, baseUrl } = readEnv();
  return Boolean(apiKey && baseUrl);
}

export async function chatLLM(
  messages: LLMMessage[],
  opts?: Partial<Pick<LLMConfig, 'model' | 'temperature' | 'maxTokens'>>,
): Promise<string> {
  const config = { ...readEnv(), ...opts };
  if (!config.apiKey || !config.baseUrl) {
    throw new Error(
      'Kemetos1 LLM is not configured. Set VITE_KEMETOS1_LLM_API_KEY and VITE_KEMETOS1_LLM_BASE_URL, '
      + 'or run without a key to use local heuristics.',
    );
  }

  const base = config.baseUrl.replace(/\/$/, '');
  const url = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LLM request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}
