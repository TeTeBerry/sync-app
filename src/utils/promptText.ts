/** H5 简易输入；小程序阶段可替换为自定义弹层 */
export function promptText(message: string, defaultValue = ""): string | null {
  if (typeof window === "undefined" || typeof window.prompt !== "function") {
    return null;
  }

  const value = window.prompt(message, defaultValue);
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed || null;
}
