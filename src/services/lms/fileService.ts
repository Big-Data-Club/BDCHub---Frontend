import { ApiClient, type RequestOptions } from "../common/api";
import { ApiError } from "../common/apiError";
import type { FileInfo } from "@/types/lms/course";

type UploadType = "video" | "document" | "image";
const filesClient = new ApiClient("/lmsapiv1");

function decodeFileInfo(response: unknown): FileInfo {
  const data =
    response && typeof response === "object" && "data" in response
      ? response.data
      : null;
  if (!data || typeof data !== "object")
    throw new ApiError(
      "Phản hồi upload không hợp lệ",
      200,
      "/files/upload",
      "INVALID_RESPONSE",
    );
  const file = data as Record<string, unknown>;
  if (
    !["file_id", "file_name", "file_url", "file_path", "file_type"].every(
      (key) => typeof file[key] === "string",
    ) ||
    typeof file.file_size !== "number" ||
    !file.file_path
  ) {
    throw new ApiError(
      "Phản hồi upload không hợp lệ",
      200,
      "/files/upload",
      "INVALID_RESPONSE",
    );
  }
  return file as unknown as FileInfo;
}

export const fileService = {
  async upload(
    file: File,
    type: UploadType,
    options?: RequestOptions,
  ): Promise<FileInfo> {
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    return decodeFileInfo(
      await filesClient.uploadFile<unknown>("/files/upload", form, options),
    );
  },
};
