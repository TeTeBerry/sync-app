/** Taro/wx.request JSON-serializes object `data`; a pre-stringified body is sent as-is and Nest may not parse it. */
export function taroRequestData(init: RequestInit): unknown {
  const { body, method = "GET", headers } = init;
  if (body == null || body === "") return undefined;

  const headerRecord = headers as Record<string, string> | undefined;
  const contentType =
    headerRecord?.["Content-Type"] ?? headerRecord?.["content-type"] ?? "";
  const isJsonBody =
    method.toUpperCase() !== "GET" &&
    contentType.toLowerCase().includes("application/json");

  if (isJsonBody && typeof body === "string") {
    try {
      return JSON.parse(body) as unknown;
    } catch {
      return body;
    }
  }

  return body;
}
