export function appendIfPresent(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
}

export function appendFiles(formData: FormData, key: string, files?: FileList | File[]) {
  if (!files) return;
  Array.from(files).forEach((file) => formData.append(key, file));
}
