/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Preview / noindex convention. Any value other than the literal string
   * "false" is treated as preview mode. Defaults to preview when unset.
   */
  readonly PUBLIC_PREVIEW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
