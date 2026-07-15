import { isInteractive, type xThemeImage } from '@xui/core';
import * as React from 'react';

export type xPromptInputHandle = {
  /** Focus the text input */
  focus: () => void;
  /** Get current prompt text */
  getPrompt: () => string;
  /** Set prompt text programmatically */
  setPrompt: (value: string) => void;
  /** Get current attached image */
  getImage: () => xThemeImage | undefined;
  /** Set image programmatically */
  setImage: (image: xThemeImage | undefined) => void;
  /** Clear both prompt and image */
  clear: () => void;
};

export type xPromptInputProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSubmit'> & {
  /** Default prompt text */
  defaultPrompt?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is loading / busy */
  loading?: boolean;
  labels?: {
    placeholder?: string;
    imageAlt?: string;
    removeImage?: string;
    addImage?: string;
    dropHint?: string;
  };
  /** Called when prompt text changes */
  onPromptChange?: (prompt: string) => void;
  /** Called when image changes */
  onImageChange?: (image: xThemeImage | undefined) => void;
  /** Called when user presses Enter (without shift) */
  onSubmit?: (prompt: string, image: xThemeImage | undefined) => void;
};

const defaultLabels = {
  placeholder: '描述你想要的主题风格，可粘贴或拖入参考图...',
  imageAlt: '参考图片',
  removeImage: '移除',
  addImage: '📎',
  dropHint: '松开以添加图片',
};

function isRemoteImageUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    });
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}

function getImageFileFromTransfer(transfer: DataTransfer | null): File | undefined {
  if (!transfer) {
    return undefined;
  }

  for (const item of Array.from(transfer.items)) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        return file;
      }
    }
  }

  for (const file of Array.from(transfer.files)) {
    if (file.type.startsWith('image/')) {
      return file;
    }
  }

  return undefined;
}

export const xPromptInput = React.forwardRef<xPromptInputHandle, xPromptInputProps>(function xPromptInput(
  {
    defaultPrompt = '',
    disabled = false,
    loading = false,
    labels,
    onPromptChange,
    onImageChange,
    onSubmit,
    className,
    ...props
  },
  ref
) {
  const interactive = isInteractive({ disabled, loading });
  const text = { ...defaultLabels, ...labels };
  const [prompt, setPromptState] = React.useState(defaultPrompt);
  const [image, setImageState] = React.useState<xThemeImage | undefined>();
  const [isDragOver, setIsDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragCounterRef = React.useRef(0);

  // Internal setters that also fire callbacks
  const setPrompt = React.useCallback(
    (value: string) => {
      setPromptState(value);
      onPromptChange?.(value);
    },
    [onPromptChange]
  );

  const setImage = React.useCallback(
    (value: xThemeImage | undefined) => {
      setImageState(value);
      onImageChange?.(value);
    },
    [onImageChange]
  );

  // Expose imperative handle
  React.useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      getPrompt: () => prompt,
      setPrompt: (value: string) => setPrompt(value),
      getImage: () => image,
      setImage: (value: xThemeImage | undefined) => setImage(value),
      clear: () => {
        setPrompt('');
        setImage(undefined);
      },
    }),
    [prompt, image, setPrompt, setImage]
  );

  const handleImageFile = React.useCallback(
    async (file: File) => {
      if (!interactive) return;
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setImage({ dataUrl, name: file.name, type: file.type });
      } catch {
        // silently ignore read errors
      }
    },
    [interactive, setImage]
  );

  // Paste handler: images from clipboard or URL text
  const handlePaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!interactive) return;

      const imageFile = getImageFileFromTransfer(event.clipboardData);
      if (imageFile) {
        event.preventDefault();
        handleImageFile(imageFile);
        return;
      }

      // Check if pasted text is a URL
      const pastedText = event.clipboardData.getData('text').trim();
      if (isRemoteImageUrl(pastedText)) {
        event.preventDefault();
        setImage({ url: pastedText, name: pastedText });
      }
    },
    [handleImageFile, interactive, setImage]
  );

  // Drag & drop handlers
  const handleDragEnter = React.useCallback(
    (event: React.DragEvent) => {
      if (!interactive) return;
      event.preventDefault();
      event.stopPropagation();
      dragCounterRef.current++;
      if (event.dataTransfer?.types.some((type) => type === 'Files' || type.startsWith('image/'))) {
        setIsDragOver(true);
      }
    },
    [interactive]
  );

  const handleDragLeave = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragOver(false);
      if (!interactive) return;

      const imageFile = getImageFileFromTransfer(event.dataTransfer);
      if (imageFile) {
        handleImageFile(imageFile);
      }
    },
    [handleImageFile, interactive]
  );

  // File input change
  const handleFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleImageFile(file);
      }
      // Reset so the same file can be re-selected
      event.target.value = '';
    },
    [handleImageFile]
  );

  // Keyboard: Enter to submit, Shift+Enter for newline
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (interactive && prompt.trim()) {
          onSubmit?.(prompt, image);
        }
      }
    },
    [interactive, prompt, image, onSubmit]
  );

  // Auto-resize textarea
  const handleInput = React.useCallback(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  // Thumbnail preview URL
  const thumbnailSrc = image?.dataUrl ?? image?.url;

  return (
    <div
      {...props}
      className={[
        'xui-prompt-input',
        isDragOver ? 'xui-prompt-input--drag-over' : '',
        !interactive ? 'xui-prompt-input--disabled' : '',
        loading ? 'xui-prompt-input--loading' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="xui-prompt-input__drop-overlay">
          <span>{text.dropHint}</span>
        </div>
      )}

      {/* Image thumbnail */}
      {thumbnailSrc && (
        <div className="xui-prompt-input__image-chip">
          <img
            className="xui-prompt-input__image-thumb"
            src={thumbnailSrc}
            alt={text.imageAlt}
          />
          <span className="xui-prompt-input__image-name">
            {image?.name ? (image.name.length > 20 ? `${image.name.slice(0, 18)}…` : image.name) : text.imageAlt}
          </span>
          <button
            className="xui-prompt-input__image-remove"
            type="button"
            onClick={() => setImage(undefined)}
            disabled={!interactive}
            aria-busy={loading || undefined}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="xui-prompt-input__row">
        <textarea
          ref={inputRef}
          className="xui-prompt-input__textarea"
          rows={1}
          placeholder={text.placeholder}
          value={prompt}
          disabled={!interactive}
          onChange={(event) => setPrompt(event.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
        />
        <button
          className="xui-prompt-input__attach"
          type="button"
          title={text.addImage}
          disabled={!interactive}
          aria-busy={loading || undefined}
          onClick={() => fileInputRef.current?.click()}
        >
          {text.addImage}
        </button>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          tabIndex={-1}
        />
      </div>
    </div>
  );
});
