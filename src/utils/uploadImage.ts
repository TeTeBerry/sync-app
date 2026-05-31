import Taro from "@tarojs/taro";
import { API_BASE_URL } from "../constants/api";
import type { ApiResponse } from "../types/backend";
import { ownerParams } from "./session";

/** 选择手环图，返回临时文件路径（已尽量压缩）。 */
export async function pickWristbandImagePath(): Promise<string | null> {
  const result = await Taro.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
  }).catch(() => null);

  const path = result?.tempFilePaths?.[0];
  if (!path) return null;

  const compressed = await Taro.compressImage({ src: path, quality: 80 }).catch(() => null);
  return compressed?.tempFilePath ?? path;
}

export async function uploadImageFile(filePath: string): Promise<string> {
  const base = API_BASE_URL.replace(/\/$/, "");
  const url = `${base}/uploads/images`;
  const formData = ownerParams();

  const res = await Taro.uploadFile({
    url,
    filePath,
    name: "file",
    formData,
    header: {
      Accept: "application/json",
    },
  });

  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`上传失败 (${res.statusCode})`);
  }

  let parsed: ApiResponse<{ url: string }>;
  try {
    parsed = JSON.parse(res.data) as ApiResponse<{ url: string }>;
  } catch {
    throw new Error("上传响应解析失败");
  }

  if (parsed.code !== 200 || !parsed.data?.url) {
    throw new Error(parsed.message || "上传失败");
  }

  return parsed.data.url;
}
