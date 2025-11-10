import * as React from "react";

export type FileUploadPanelStatus = "idle" | "processing" | "ready" | "error";

type FileUploadPanelProps = {
  title?: string;
  description?: string;
  status?: FileUploadPanelStatus;
  fileName?: string | null;
  helperText?: string | null;
  errorMessage?: string | null;
  accept?: string;
  actionLabel?: string;
  busyLabel?: string;
  readyLabel?: string;
  className?: string;
  controlClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  statusClassName?: string;
  fileNameClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
  onSelectFile?: (file: File) => void;
};

export function FileUploadPanel(props: FileUploadPanelProps) {
  const {
    title = "Upload knowledge",
    description,
    status = "idle",
    fileName,
    helperText,
    errorMessage,
    accept,
    actionLabel = "Select file",
    busyLabel = "Processing",
    readyLabel = "Indexed",
    className = "",
    controlClassName = "",
    titleClassName = "",
    descriptionClassName = "",
    statusClassName = "",
    fileNameClassName = "",
    helperClassName = "",
    errorClassName = "",
    onSelectFile,
  } = props;

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onSelectFile?.(file);
    event.target.value = "";
  };

  const statusLabel = (() => {
    if (status === "processing") return busyLabel;
    if (status === "ready") return readyLabel;
    if (status === "error") return "Error";
    return "Idle";
  })();

  return (
    <div
      className={className}
      data-status={status}
    >
      <div>
        <div>
          <div className={titleClassName}>{title}</div>
          {description && <p className={descriptionClassName}>{description}</p>}
        </div>
        <button
          type="button"
          className={controlClassName}
          onClick={() => inputRef.current?.click()}
        >
          {actionLabel}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: "none" }}
        />
      </div>

      <div>
        <span className={statusClassName}>{statusLabel}</span>
        {fileName && (
          <span className={fileNameClassName}>
            {fileName}
          </span>
        )}
      </div>

      {helperText && <p className={helperClassName}>{helperText}</p>}

      {status === "error" && errorMessage && (
        <p className={errorClassName} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default FileUploadPanel;
