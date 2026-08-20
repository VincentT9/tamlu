import { postFormData } from "@/shared/api/client";

export interface UploadedFile {
  url: string;
}

export const uploadApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const uploaded = await postFormData<UploadedFile>("/api/upload", formData);

    if (!uploaded.url?.trim()) {
      throw new Error("Tải tệp thành công nhưng máy chủ không trả về đường dẫn tệp.");
    }

    return { ...uploaded, url: uploaded.url.trim() };
  },
};
