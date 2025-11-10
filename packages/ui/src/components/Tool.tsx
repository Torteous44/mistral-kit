import * as React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";

export type ToolState =
  | "pending"          // Tool call initiated, waiting to execute
  | "running"          // Tool is executing
  | "completed"        // Tool completed successfully
  | "error";           // Tool execution failed

type ToolContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ToolContext = React.createContext<ToolContextValue | null>(null);

function useToolContext() {
  const context = React.useContext(ToolContext);
  if (!context) {
    throw new Error("Tool compound components must be used within Tool");
  }
  return context;
}

// Root component
type ToolProps = {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
};

export function Tool({ defaultOpen, open, onOpenChange, className, children }: ToolProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange ?? (() => {}) : setInternalOpen;

  return (
    <ToolContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className={className}>
        {children}
      </Collapsible.Root>
    </ToolContext.Provider>
  );
}

// Header component
type ToolHeaderProps = {
  toolName: string;
  state: ToolState;
  className?: string;
  triggerClassName?: string;
  nameClassName?: string;
  badgeClassName?: string;
  children?: React.ReactNode;
};

export function ToolHeader({
  toolName,
  state,
  className,
  triggerClassName,
  nameClassName,
  badgeClassName,
  children,
}: ToolHeaderProps) {
  const { open } = useToolContext();

  const stateLabel = {
    pending: "Pending",
    running: "Running",
    completed: "Completed",
    error: "Error",
  }[state];

  return (
    <div className={className} data-state={state}>
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className={triggerClassName}
          data-open={open}
          data-state={state}
        >
          <span className={nameClassName}>{toolName}</span>
          <span className={badgeClassName} data-state={state}>
            {stateLabel}
          </span>
          {children}
        </button>
      </Collapsible.Trigger>
    </div>
  );
}

// Content container
type ToolContentProps = {
  className?: string;
  children: React.ReactNode;
};

export function ToolContent({ className, children }: ToolContentProps) {
  return (
    <Collapsible.Content className={className}>
      {children}
    </Collapsible.Content>
  );
}

// Input parameters display
type ToolInputProps = {
  input: any;
  className?: string;
  labelClassName?: string;
  contentClassName?: string;
};

export function ToolInput({ input, className, labelClassName, contentClassName }: ToolInputProps) {
  const formattedInput = typeof input === "string" ? input : JSON.stringify(input, null, 2);

  return (
    <div className={className}>
      <div className={labelClassName}>Parameters</div>
      <pre className={contentClassName}>
        <code>{formattedInput}</code>
      </pre>
    </div>
  );
}

// Output/result display
type ToolOutputProps = {
  output?: React.ReactNode | any;
  errorText?: string;
  className?: string;
  labelClassName?: string;
  contentClassName?: string;
  errorClassName?: string;
};

export function ToolOutput({
  output,
  errorText,
  className,
  labelClassName,
  contentClassName,
  errorClassName,
}: ToolOutputProps) {
  if (errorText) {
    return (
      <div className={className}>
        <div className={labelClassName}>Error</div>
        <div className={errorClassName}>{errorText}</div>
      </div>
    );
  }

  if (!output) return null;

  const isReactNode = React.isValidElement(output);
  const formattedOutput = isReactNode ? output : typeof output === "string" ? output : JSON.stringify(output, null, 2);

  return (
    <div className={className}>
      <div className={labelClassName}>Result</div>
      {isReactNode ? (
        <div className={contentClassName}>{formattedOutput}</div>
      ) : (
        <pre className={contentClassName}>
          <code>{formattedOutput}</code>
        </pre>
      )}
    </div>
  );
}

export default Tool;
