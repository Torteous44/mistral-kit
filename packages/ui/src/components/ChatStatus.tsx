import type { ReactNode } from "react";

type Variant = "info" | "error" | "warning";

export type ChatStatusProps = {
  variant?: Variant;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  unstyled?: boolean;
};

const variantClasses: Record<Variant, string> = {
  info: "border-neutral-200 bg-white text-[#101010]",
  warning: "border-yellow-400/40 bg-yellow-50 text-yellow-800",
  error: "border-red-500/40 bg-red-50 text-red-700",
};

const baseStructureClass = "flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-sm font-medium";
const innerStructureClass = "flex items-center gap-2";

const merge = (...classes: Array<string | undefined | null>) => classes.filter(Boolean).join(" ");

export function ChatStatus({
  variant = "info",
  message,
  icon,
  action,
  className = "",
  unstyled = false,
}: ChatStatusProps) {
  const structureClass = unstyled ? "" : baseStructureClass;
  const toneClass = unstyled ? "" : variantClasses[variant];
  const innerClass = unstyled ? "" : innerStructureClass;

  return (
    <div className={merge(structureClass, toneClass, className)}>
      <div className={innerClass}>
        {icon}
        <span>{message}</span>
      </div>
      {action}
    </div>
  );
}

export default ChatStatus;
