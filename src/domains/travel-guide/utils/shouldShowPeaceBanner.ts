export function shouldShowPeaceBanner(
  hasPayload: boolean,
  dismissed: boolean,
): boolean {
  return hasPayload && !dismissed;
}
