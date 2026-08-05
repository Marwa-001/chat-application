export function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXT_STYLES = {
  pdf: { bg: "bg-red-100", text: "text-red-600", label: "pdf" },
  doc: { bg: "bg-blue-100", text: "text-blue-600", label: "doc" },
  docx: { bg: "bg-blue-100", text: "text-blue-600", label: "doc" },
  xls: { bg: "bg-green-100", text: "text-green-700", label: "xls" },
  xlsx: { bg: "bg-green-100", text: "text-green-700", label: "xls" },
  zip: { bg: "bg-purple-100", text: "text-purple-600", label: "zip" },
  mp4: { bg: "bg-pink-100", text: "text-pink-600", label: "mp4" },
  mov: { bg: "bg-pink-100", text: "text-pink-600", label: "mov" },
};

export function getFileStyle(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  return EXT_STYLES[ext] || { bg: "bg-gray-100", text: "text-gray-600", label: ext || "file" };
}