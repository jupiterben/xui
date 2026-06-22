import type { xThemeImage, xThemeInput } from '../packages/core/src/theme';

export const XUI_THEME_GENERATION_HISTORY_STORAGE_KEY = 'xui:theme-generation-history';
export const XUI_THEME_GENERATION_HISTORY_CHANGE_EVENT = 'xui:theme-generation-history-change';

const HISTORY_LIMIT = 30;

export type xThemeGenerationPlayground = 'react' | 'vue';

export type xThemeGenerationOutput = {
  source?: 'local' | 'model' | 'fallback';
  theme: xThemeInput;
  error?: string;
};

export type xThemeGenerationHistoryItem = {
  id: string;
  createdAt: string;
  playground: xThemeGenerationPlayground;
  input: {
    prompt: string;
    image?: xThemeImage;
  };
  output: xThemeGenerationOutput;
};

function getStorage() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function createHistoryId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeImage(image: xThemeImage | undefined): xThemeImage | undefined {
  if (!image) {
    return undefined;
  }

  return {
    dataUrl: image.dataUrl,
    url: image.url,
    name: image.name,
    type: image.type
  };
}

function removeInlineImages(history: xThemeGenerationHistoryItem[]) {
  return history.map((item) => ({
    ...item,
    input: {
      ...item.input,
      image: item.input.image
        ? {
            ...item.input.image,
            dataUrl: undefined
          }
        : undefined
    }
  }));
}

export function readThemeGenerationHistory(): xThemeGenerationHistoryItem[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  try {
    const value = storage.getItem(XUI_THEME_GENERATION_HISTORY_STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? (parsed as xThemeGenerationHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveThemeGenerationHistory(
  playground: xThemeGenerationPlayground,
  prompt: string,
  image: xThemeImage | undefined,
  output: xThemeGenerationOutput
) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const history: xThemeGenerationHistoryItem[] = [
    {
      id: createHistoryId(),
      createdAt: new Date().toISOString(),
      playground,
      input: {
        prompt,
        image: normalizeImage(image)
      },
      output
    },
    ...readThemeGenerationHistory()
  ].slice(0, HISTORY_LIMIT);

  try {
    storage.setItem(XUI_THEME_GENERATION_HISTORY_STORAGE_KEY, JSON.stringify(history));
    window.dispatchEvent(new CustomEvent(XUI_THEME_GENERATION_HISTORY_CHANGE_EVENT));
  } catch {
    try {
      storage.setItem(XUI_THEME_GENERATION_HISTORY_STORAGE_KEY, JSON.stringify(removeInlineImages(history)));
      window.dispatchEvent(new CustomEvent(XUI_THEME_GENERATION_HISTORY_CHANGE_EVENT));
    } catch {
      // Ignore storage quota or privacy-mode failures; generation should still complete.
    }
  }
}
