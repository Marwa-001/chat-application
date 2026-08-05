import api from "./axios";

export async function uploadFiles(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await api.post("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.attachments; // [{url, name, size, type, mimeType}]
}