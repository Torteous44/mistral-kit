import type { FileUploadStatus } from "../hooks/useFileUpload";

const STATUS_COPY: Record<FileUploadStatus, string> = {
  idle: "Ready to attach knowledge.",
  uploading: "Uploading document…",
  chunking: "Chunking document…",
  embedding: "Embedding chunks…",
  ready: "Attachment ready to send.",
  error: "Upload failed.",
};

export type UploadStatusProps = {
  status: FileUploadStatus;
  fileName?: string | null;
  error?: Error | null;
  className?: string;
  unstyled?: boolean;
};

const baseStructureClass = "flex flex-col gap-1 rounded-2xl border px-3 py-2 text-sm";
const toneClass = {
  default: "border-mistral-black/10 bg-white text-mistral-black",
  error: "border-red-400/40 bg-red-50 text-red-700",
};

const merge = (...classes: Array<string | undefined | null>) => classes.filter(Boolean).join(" ");

export function UploadStatus({ status, fileName, error, className = "", unstyled = false }: UploadStatusProps) {
  const containerClass = merge(
    unstyled ? "" : baseStructureClass,
    unstyled ? "" : toneClass[status === "error" ? "error" : "default"],
    className
  );
  const secondaryTextClass = unstyled ? "" : "text-xs opacity-70";
  const messageClass = unstyled ? "" : "font-semibold";

  return (
    <div className={containerClass}>
      <span className={messageClass}>{STATUS_COPY[status]}</span>
      {fileName && <span className={secondaryTextClass}>{fileName}</span>}
      {status === "error" && error?.message && <span className={unstyled ? "" : "text-xs"}>{error.message}</span>}
    </div>
  );
}

export default UploadStatus;
