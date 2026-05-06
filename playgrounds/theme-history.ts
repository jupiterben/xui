import type { XuiThemeImage, XuiThemeInput } from '../packages/core/src/theme';

export const XUI_THEME_GENERATION_HISTORY_STORAGE_KEY = 'xui:theme-generation-history';
export const XUI_THEME_GENERATION_HISTORY_CHANGE_EVENT = 'xui:theme-generation-history-change';

const HISTORY_LIMIT = 30;

export type XuiThemeGenerationPlayground = 'react' | 'vue';

export type XuiThemeGenerationOutput = {
  source?: 'local' | 'model' | 'fallback';
  theme: XuiThemeInput;
  error?: string;
};

export type XuiThemeGenerationHistoryItem = {
  id: string;
  createdAt: string;
  playground: XuiThemeGenerationPlayground;
  input: {
    prompt: string;
    image?: XuiThemeImage;
  };
  output: XuiThemeGenerationOutput;
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

function normalizeImage(image: XuiThemeImage | undefined): XuiThemeImage | undefined {
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

function removeInlineImages(history: XuiThemeGenerationHistoryItem[]) {
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

export function readThemeGenerationHistory(): XuiThemeGenerationHistoryItem[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  try {
    const value = storage.getItem(XUI_THEME_GENERATION_HISTORY_STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? (parsed as XuiThemeGenerationHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveThemeGenerationHistory(
  playground: XuiThemeGenerationPlayground,
  prompt: string,
  image: XuiThemeImage | undefined,
  output: XuiThemeGenerationOutput
) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const history: XuiThemeGenerationHistoryItem[] = [
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
