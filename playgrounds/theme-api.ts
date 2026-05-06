import type { IncomingMessage, ServerResponse } from "node:http";
import {
  generateThemeFromPrompt,
  normalizeThemeInput,
  themeJsonSchema,
  type XuiThemeImage,
  type XuiThemeInput,
} from "../packages/core/src/theme";

type ThemeApiResponse = {
  source: "local" | "model" | "fallback";
  theme: XuiThemeInput;
  error?: string;
};

type ThemeApiEnv = {
  OPENAI_API_KEY?: string;
  XUI_THEME_API_KEY?: string;
  XUI_THEME_API_BASE_URL?: string;
  XUI_THEME_MODEL?: string;
};

let themeRequestId = 0;

function logThemePath(
  requestId: number | "setup",
  step: string,
  details?: Record<string, unknown>,
) {
  console.info("[xui-theme-api]", { requestId, step, ...details });
}

function readJsonBody(request: IncomingMessage) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: ThemeApiResponse | { error: string },
) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function getObjectKeys(value: unknown) {
  return typeof value === "object" && value
    ? Object.keys(value).slice(0, 8).join(", ")
    : typeof value;
}

function getPayloadError(value: unknown) {
  if (typeof value !== "object" || !value) {
    return undefined;
  }

  const payload = value as { error?: unknown };
  if (typeof payload.error === "string") {
    return payload.error;
  }

  if (typeof payload.error !== "object" || !payload.error) {
    return undefined;
  }

  const error = payload.error as {
    message?: unknown;
    type?: unknown;
    code?: unknown;
  };
  return (
    [error.message, error.type, error.code]
      .filter((item): item is string => typeof item === "string")
      .join(" | ") || undefined
  );
}

function readContentText(content: unknown): string | undefined {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return undefined;
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (typeof part !== "object" || !part) {
        return undefined;
      }

      const item = part as { text?: unknown; content?: unknown };
      return typeof item.text === "string"
        ? item.text
        : readContentText(item.content);
    })
    .filter(Boolean)
    .join("\n");
}

function extractOutputText(payload: unknown) {
  if (typeof payload !== "object" || !payload) {
    return undefined;
  }

  const response = payload as {
    output_text?: unknown;
    output?: Array<{ content?: unknown }>;
    choices?: Array<{
      message?: { content?: unknown; reasoning_content?: unknown };
      text?: unknown;
    }>;
  };

  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  for (const output of response.output ?? []) {
    const text = readContentText(output.content);
    if (text) {
      return text;
    }
  }

  for (const choice of response.choices ?? []) {
    if (typeof choice.text === "string") {
      return choice.text;
    }

    // content is the primary field; reasoning_content is a fallback for
    // thinking/hybrid models (Qwen3, DeepSeek-R1, etc.) where the answer
    // may be embedded inside the reasoning block when structured output is
    // not supported by the inference server.
    const text =
      readContentText(choice.message?.content) ||
      readContentText(choice.message?.reasoning_content);
    if (text) {
      return text;
    }
  }

  return undefined;
}

function parseJsonObject(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed
    .match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)?.[1]
    ?.trim();
  const normalized = fenced ?? trimmed;

  try {
    return JSON.parse(normalized);
  } catch {
    const start = normalized.indexOf("{");
    const end = normalized.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(normalized.slice(start, end + 1));
    }

    throw new Error("Theme model returned text that is not JSON");
  }
}

function isHexColor(value: unknown) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isNumberInRange(value: unknown, min: number, max: number) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function assertThemePayload(value: unknown): asserts value is XuiThemeInput {
  if (typeof value !== "object" || !value) {
    throw new Error("Theme model JSON is not an object");
  }

  const theme = value as Partial<XuiThemeInput>;
  const invalidFields = [
    typeof theme.name === "string" && theme.name.trim() ? undefined : "name",
    isHexColor(theme.accent) ? undefined : "accent",
    isHexColor(theme.secondary) ? undefined : "secondary",
    isHexColor(theme.background) ? undefined : "background",
    isHexColor(theme.error) ? undefined : "error",
    isHexColor(theme.warning) ? undefined : "warning",
    isHexColor(theme.success) ? undefined : "success",
    isHexColor(theme.info) ? undefined : "info",
    typeof theme.fontFamily === "string" && theme.fontFamily.trim()
      ? undefined
      : "fontFamily",
    isNumberInRange(theme.fontScale, 0.86, 1.24) ? undefined : "fontScale",
    isNumberInRange(theme.radius, 0, 28) ? undefined : "radius",
    isNumberInRange(theme.density, 0.72, 1.35) ? undefined : "density",
    isNumberInRange(theme.borderWidth, 0, 3) ? undefined : "borderWidth",
    isNumberInRange(theme.shadowStrength, 0, 1) ? undefined : "shadowStrength",
  ].filter(Boolean);

  if (invalidFields.length) {
    throw new Error(
      `Theme model JSON has invalid fields: ${invalidFields.join(", ")}`,
    );
  }
}

function normalizeThemeImage(value: unknown): XuiThemeImage | undefined {
  if (typeof value !== "object" || !value) {
    return undefined;
  }

  const input = value as Partial<XuiThemeImage>;
  const dataUrl =
    typeof input.dataUrl === "string" &&
    /^data:image\/(png|jpe?g|webp);base64,/i.test(input.dataUrl)
      ? input.dataUrl
      : undefined;
  const url =
    typeof input.url === "string" && /^https?:\/\/\S+$/i.test(input.url)
      ? input.url
      : undefined;

  if (!dataUrl && !url) {
    return undefined;
  }

  return {
    dataUrl,
    url,
    name: typeof input.name === "string" ? input.name : undefined,
    type: typeof input.type === "string" ? input.type : undefined,
  };
}

function getModelConfig(env: ThemeApiEnv) {
  const apiKey =
    env.XUI_THEME_API_KEY ??
    env.OPENAI_API_KEY ??
    process.env.XUI_THEME_API_KEY ??
    process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return undefined;
  }

  const baseUrl =
    env.XUI_THEME_API_BASE_URL ??
    process.env.XUI_THEME_API_BASE_URL ??
    "https://api.openai.com/v1";
  const model =
    env.XUI_THEME_MODEL ?? process.env.XUI_THEME_MODEL ?? "gpt-5.4-mini";
  return { apiKey, baseUrl: baseUrl.replace(/\/$/, ""), model };
}

function getBaseUrlCandidates(baseUrl: string) {
  return baseUrl.endsWith("/v1") ? [baseUrl] : [baseUrl, `${baseUrl}/v1`];
}

function buildUserText(prompt: string, image?: XuiThemeImage) {
  return `Generate an xui theme from this prompt: ${prompt}${image ? "\nUse the uploaded image as the primary visual reference for palette, density, radius, and typography tone." : ""}`;
}

const themeJsonInstruction =
  'Return only a JSON object, with no markdown and no explanation. The JSON must contain exactly these keys: "name", "accent", "secondary", "background", "error", "warning", "success", "info", "fontFamily", "fontScale", "radius", "density", "borderWidth", "shadowStrength". Colors must be #RRGGBB. "error" is for destructive/danger states (reds), "warning" for caution (ambers/yellows), "success" for positive outcomes (greens), "info" for informational highlights (blues). Numeric ranges: fontScale 0.86-1.24, radius 0-28, density 0.72-1.35, borderWidth 0-3, shadowStrength 0-1.';

function parseThemeModelPayload(payload: unknown) {
  const payloadError = getPayloadError(payload);
  if (payloadError) {
    throw new Error(`Theme model returned an error: ${payloadError}`);
  }

  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error(
      `Theme model returned no JSON text. Response keys: ${getObjectKeys(payload)}`,
    );
  }

  const parsed = parseJsonObject(outputText);
  assertThemePayload(parsed);

  return normalizeThemeInput(parsed);
}

async function generateWithResponsesApi(
  prompt: string,
  image: XuiThemeImage | undefined,
  env: ThemeApiEnv,
  requestId: number,
) {
  const config = getModelConfig(env);
  if (!config) {
    logThemePath(requestId, "model-config-missing");
    return undefined;
  }

  const userContent = [
    {
      type: "input_text",
      text: buildUserText(prompt, image),
    },
    ...(image
      ? [
          {
            type: "input_image",
            image_url: image.dataUrl ?? image.url,
          },
        ]
      : []),
  ];

  let lastError: unknown;

  for (const baseUrl of getBaseUrlCandidates(config.baseUrl)) {
    logThemePath(requestId, "responses-api-request", {
      endpoint: `${baseUrl}/responses`,
      model: config.model,
      hasImage: Boolean(image),
    });

    const response = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        input: [
          {
            role: "system",
            content: `You are a design-system theme generator. Return a practical UI theme for CSS variables. Prefer accessible contrast and coherent product UI styling. ${themeJsonInstruction}`,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        max_output_tokens: 1000,
        text: {
          format: {
            type: "json_schema",
            name: "xui_theme",
            strict: true,
            schema: themeJsonSchema,
          },
        },
      }),
    });

    logThemePath(requestId, "responses-api-response", {
      endpoint: `${baseUrl}/responses`,
      status: response.status,
      ok: response.ok,
    });

    try {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          `Theme model request failed: ${response.status} ${message.slice(0, 240)}`,
        );
      }

      const theme = parseThemeModelPayload(await response.json());
      logThemePath(requestId, "responses-api-json-valid", {
        endpoint: `${baseUrl}/responses`,
        themeName: theme.name,
      });
      return theme;
    } catch (error) {
      lastError = error;
      logThemePath(requestId, "responses-api-candidate-failed", {
        endpoint: `${baseUrl}/responses`,
        error:
          error instanceof Error
            ? error.message
            : "Unknown responses API error",
      });
      if (!shouldRetryWithAlternateEndpoint(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Responses API request failed");
}

async function generateWithChatCompletionsApi(
  prompt: string,
  image: XuiThemeImage | undefined,
  env: ThemeApiEnv,
  requestId: number,
) {
  const config = getModelConfig(env);
  if (!config) {
    logThemePath(requestId, "model-config-missing");
    return undefined;
  }

  const imageUrl = image?.dataUrl ?? image?.url;
  const userContent = imageUrl
    ? [
        { type: "text", text: buildUserText(prompt, image) },
        { type: "image_url", image_url: { url: imageUrl } },
      ]
    : buildUserText(prompt);

  let lastError: unknown;

  for (const baseUrl of getBaseUrlCandidates(config.baseUrl)) {
    logThemePath(requestId, "chat-completions-request", {
      endpoint: `${baseUrl}/chat/completions`,
      model: config.model,
      hasImage: Boolean(imageUrl),
    });

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: `You are a design-system theme generator. Prefer accessible contrast and coherent product UI styling. ${themeJsonInstruction}`,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        max_tokens: 2000,
        // Disable thinking mode on hybrid models (Qwen3, DeepSeek, etc.) so
        // the response content is not empty with the answer buried in
        // reasoning_content. Ignored by non-thinking model servers.
        enable_thinking: false,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "xui_theme",
            strict: true,
            schema: themeJsonSchema,
          },
        },
      }),
    });

    logThemePath(requestId, "chat-completions-response", {
      endpoint: `${baseUrl}/chat/completions`,
      status: response.status,
      ok: response.ok,
    });

    try {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          `Theme chat model request failed: ${response.status} ${message.slice(0, 240)}`,
        );
      }

      const theme = parseThemeModelPayload(await response.json());
      logThemePath(requestId, "chat-completions-json-valid", {
        endpoint: `${baseUrl}/chat/completions`,
        themeName: theme.name,
      });
      return theme;
    } catch (error) {
      lastError = error;
      logThemePath(requestId, "chat-completions-candidate-failed", {
        endpoint: `${baseUrl}/chat/completions`,
        error:
          error instanceof Error
            ? error.message
            : "Unknown chat completions API error",
      });
      if (!shouldRetryWithAlternateEndpoint(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Chat Completions API request failed");
}

function shouldRetryWithAlternateEndpoint(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /unexpected endpoint|not found|method|404|405/i.test(error.message);
}

function shouldRetryWithChatCompletions(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /\/responses|responses api|unexpected endpoint|method|404|405|not json|no json text|invalid fields/i.test(
    error.message,
  );
}

async function generateWithModel(
  prompt: string,
  image: XuiThemeImage | undefined,
  env: ThemeApiEnv,
  requestId: number,
) {
  try {
    return await generateWithResponsesApi(prompt, image, env, requestId);
  } catch (error) {
    if (shouldRetryWithChatCompletions(error)) {
      logThemePath(requestId, "responses-api-retry-chat-completions", {
        reason:
          error instanceof Error
            ? error.message
            : "Unknown responses API error",
      });
      return generateWithChatCompletionsApi(prompt, image, env, requestId);
    }

    logThemePath(requestId, "responses-api-error-no-retry", {
      error:
        error instanceof Error ? error.message : "Unknown responses API error",
    });
    throw error;
  }
}

export function themeApiPlugin(env: ThemeApiEnv = {}): {
  name: string;
  configureServer: (server: any) => void;
} {
  return {
    name: "xui-theme-api",
    configureServer(server) {
      logThemePath("setup", "middleware-mounted", { path: "/api/theme" });
      server.middlewares.use("/api/theme", async (request, response) => {
        const requestId = ++themeRequestId;
        logThemePath(requestId, "request-start", {
          method: request.method,
          url: request.url,
        });

        if (request.method !== "POST") {
          logThemePath(requestId, "method-not-allowed", {
            method: request.method,
          });
          sendJson(response, 405, { error: "Method not allowed" });
          return;
        }

        let prompt = "xui product interface";
        try {
          const body = await readJsonBody(request);
          prompt = typeof body.prompt === "string" ? body.prompt : prompt;
          const image = normalizeThemeImage(body.image);
          logThemePath(requestId, "request-body-parsed", {
            promptLength: prompt.length,
            imageSource: image?.dataUrl
              ? "data-url"
              : image?.url
                ? "url"
                : "none",
          });

          const modelTheme = await generateWithModel(
            prompt,
            image,
            env,
            requestId,
          );

          if (modelTheme) {
            logThemePath(requestId, "response-model", {
              themeName: modelTheme.name,
            });
            sendJson(response, 200, { source: "model", theme: modelTheme });
            return;
          }

          const localTheme = generateThemeFromPrompt(prompt);
          logThemePath(requestId, "response-local", {
            themeName: localTheme.name,
          });
          sendJson(response, 200, { source: "local", theme: localTheme });
        } catch (error) {
          logThemePath(requestId, "response-fallback", {
            error:
              error instanceof Error
                ? error.message
                : "Unknown theme generation error",
          });
          sendJson(response, 200, {
            source: "fallback",
            theme: generateThemeFromPrompt(prompt),
            error:
              error instanceof Error
                ? error.message
                : "Unknown theme generation error",
          });
        }
      });
    },
  };
}
