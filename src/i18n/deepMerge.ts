export type MessageValue = string | { [key: string]: MessageValue };
export type MessageTree = { [key: string]: MessageValue };

function isPlainObject(value: unknown): value is MessageTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Deep-merges `override` on top of `base`, without mutating either input.
 * This is the site's single fallback mechanism (CLAUDE.md: i18n) — every
 * locale's messages are merged over the English messages, so any key missing
 * from the active locale resolves to English automatically. There is no
 * per-key fallback logic anywhere else in the codebase.
 */
export function deepMerge(base: MessageTree, override: MessageTree): MessageTree {
  const result: MessageTree = { ...base };

  for (const key of Object.keys(override)) {
    const baseValue = result[key];
    const overrideValue = override[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
    } else {
      result[key] = overrideValue as MessageValue;
    }
  }

  return result;
}
