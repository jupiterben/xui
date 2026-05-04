import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { generateThemeFromPrompt, normalizeThemeInput, themeJsonSchema, type XuiThemeInput } from '../packages/core/src/theme';

type ThemeApiResponse = {
  source: 'local' | 'model' | 'fallback';
  theme: XuiThemeInput;
  error?: string;
};

function readJsonBody(request: IncomingMessage) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response: ServerResponse, statusCode: number, payload: ThemeApiResponse | { error: string }) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
}

function extractOutputText(payload: unknown) {
  if (typeof payload !== 'object' || !payload) {
    return undefined;
  }

  const response = payload as { output_text?: unknown; output?: Array<{ content?: Array<{ text?: unknown }> }> };
  if (typeof response.output_text === 'string') {
    return response.output_text;
  }

  for (const output of response.output ?? []) {
    for (const content of output.content ?? []) {
      if (typeof content.text === 'string') {
        return content.text;
      }
    }
  }

  return undefined;
}

async function generateWithResponsesApi(prompt: string) {
  const apiKey = process.env.XUI_THEME_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return undefined;
  }

  const baseUrl = process.env.XUI_THEME_API_BASE_URL ?? 'https://api.openai.com/v1';
  const model = process.env.XUI_THEME_MODEL ?? 'gpt-5.4-mini';
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content:
            'You are a design-system theme generator. Return a practical UI theme for CSS variables. Prefer accessible contrast and coherent product UI styling.'
        },
        {
          role: 'user',
          content: `Generate an xui theme from this prompt: ${prompt}`
        }
      ],
      max_output_tokens: 1000,
      text: {
        format: {
          type: 'json_schema',
          name: 'xui_theme',
          strict: true,
          schema: themeJsonSchema
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Theme model request failed: ${response.status}`);
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error('Theme model returned no JSON text');
  }

  return normalizeThemeInput(JSON.parse(outputText));
}

export function themeApiPlugin(): Plugin {
  return {
    name: 'xui-theme-api',
    configureServer(server) {
      server.middlewares.use('/api/theme', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'Method not allowed' });
          return;
        }

        let prompt = 'xui product interface';
        try {
          const body = await readJsonBody(request);
          prompt = typeof body.prompt === 'string' ? body.prompt : prompt;
          const modelTheme = await generateWithResponsesApi(prompt);

          if (modelTheme) {
            sendJson(response, 200, { source: 'model', theme: modelTheme });
            return;
          }

          sendJson(response, 200, { source: 'local', theme: generateThemeFromPrompt(prompt) });
        } catch (error) {
          sendJson(response, 200, {
            source: 'fallback',
            theme: generateThemeFromPrompt(prompt),
            error: error instanceof Error ? error.message : 'Unknown theme generation error'
          });
        }
      });
    }
  };
}
