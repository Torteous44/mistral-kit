import * as React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

export type ActionsProps = React.ComponentProps<"div">;

/**
 * Container for action buttons, typically displayed alongside AI messages
 */
export function Actions({ className, children, ...props }: ActionsProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export type ActionProps = React.ComponentProps<"button"> & {
  /** Tooltip text to display on hover */
  tooltip?: string;
  /** Accessible label for screen readers */
  label?: string;
};

/**
 * Individual action button with optional tooltip
 */
export function Action({
  tooltip,
  children,
  label,
  className,
  type = "button",
  ...props
}: ActionProps) {
  const button = (
    <button className={className} type={type} {...props}>
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>{button}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className={className} sideOffset={5}>
              {tooltip}
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return button;
}

export default Actions;
