import * as React from "react";

type ToolCallBadgeProps = {
  toolName?: string;
  status?: "pending" | "success" | "error";
  detail?: string;
  className?: string;
  statusClassName?: string;
  children?: React.ReactNode;
};

export default function ToolCallBadge(props: ToolCallBadgeProps) {
  const {
    toolName,
    status = "pending",
    detail,
    className = "",
    statusClassName = "",
    children,
  } = props;

  if (children) {
    return <div className={className}>{children}</div>;
  }

  const statusLabel =
    status === "success" ? "Complete" : status === "error" ? "Error" : "Running";

  return (
    <div
      className={className}
      data-status={status}
      role="status"
      aria-label={`${toolName ?? "Tool"} ${statusLabel}`}
    >
      {toolName && <span>{toolName}</span>}
      <span className={statusClassName}>{statusLabel}</span>
      {detail && <span>{detail}</span>}
    </div>
  );
}
