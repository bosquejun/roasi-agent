"use client";

import { Badge } from "@roaster/ui/components/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@roaster/ui/components/collapsible";
import { cn } from "@roaster/ui/lib/utils";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { isValidElement } from "react";

import { CodeBlock } from "./code-block";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible
    className={cn("group not-prose mb-3 w-full rounded-md border", className)}
    {...props}
  />
);

export type ToolPart = ToolUIPart | DynamicToolUIPart;

export type ToolHeaderProps = {
  title?: string;
  className?: string;
} & (
  | { type: ToolUIPart["type"]; state: ToolUIPart["state"]; toolName?: never }
  | {
      type: DynamicToolUIPart["type"];
      state: DynamicToolUIPart["state"];
      toolName: string;
    }
);

type BadgeVariant =
  | "default"
  | "landing"
  | "portfolio"
  | "saas"
  | "startup"
  | "agency"
  | "ecommerce"
  | "live"
  | "pending"
  | "reviewed"
  | "trending"
  | "launched";

const statusVariants: Record<ToolPart["state"], BadgeVariant> = {
  "approval-requested": "pending",
  "approval-responded": "landing",
  "input-available": "agency",
  "input-streaming": "pending",
  "output-available": "reviewed",
  "output-denied": "startup",
  "output-error": "live",
};

const statusLabels: Record<ToolPart["state"], string> = {
  "approval-requested": "Awaiting",
  "approval-responded": "Responded",
  "input-available": "Running",
  "input-streaming": "Pending",
  "output-available": "Done",
  "output-denied": "Denied",
  "output-error": "Error",
};

const statusIcons: Record<ToolPart["state"], ReactNode> = {
  "approval-requested": <ClockIcon className="size-3" />,
  "approval-responded": <CheckCircleIcon className="size-3" />,
  "input-available": <ClockIcon className="size-3 animate-pulse" />,
  "input-streaming": <CircleIcon className="size-3" />,
  "output-available": <CheckCircleIcon className="size-3" />,
  "output-denied": <XCircleIcon className="size-3" />,
  "output-error": <XCircleIcon className="size-3" />,
};

export const getStatusBadge = (status: ToolPart["state"]) => (
  <Badge
    variant={statusVariants[status]}
    className="gap-1 border px-1 py-0 text-[8px]"
  >
    {statusIcons[status]}
    {statusLabels[status]}
  </Badge>
);

export const ToolHeader = ({
  className,
  title,
  type,
  state,
  toolName,
  ...props
}: ToolHeaderProps) => {
  const derivedName =
    type === "dynamic-tool" ? toolName : type.split("-").slice(1).join("-");

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center justify-between gap-4 px-3 py-2",
        "border-b-[3px] border-black group-data-[state=closed]:border-b-0",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <WrenchIcon className="size-3.5 text-slate" />
        <span className="font-pixel text-[10px] tracking-wide">
          {title ?? derivedName}
        </span>
        {getStatusBadge(state)}
      </div>
      <ChevronDownIcon className="size-4 text-slate transition-transform duration-150 group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn("space-y-3 bg-smoke p-3 outline-none", className)}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolPart["input"];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div className={cn("space-y-1.5 overflow-hidden", className)} {...props}>
    <h4 className="font-pixel text-[8px] tracking-widest text-slate uppercase">
      Parameters
    </h4>
    <div className="border-[2px] border-black">
      <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
    </div>
  </div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolPart["output"];
  errorText: ToolPart["errorText"];
};

export const ToolOutput = ({
  className,
  output,
  errorText,
  ...props
}: ToolOutputProps) => {
  if (!(output || errorText)) {
    return null;
  }

  let Output = <div>{output as ReactNode}</div>;

  if (typeof output === "object" && !isValidElement(output)) {
    Output = (
      <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />
    );
  } else if (typeof output === "string") {
    Output = <CodeBlock code={output} language="json" />;
  }

  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      <h4 className="font-pixel text-[8px] tracking-widest text-slate uppercase">
        {errorText ? "Error" : "Result"}
      </h4>
      <div
        className={cn(
          "overflow-x-auto border-[2px] border-black text-xs [&_table]:w-full",
          errorText ? "bg-fire-red-soft text-fire-red" : ""
        )}
      >
        {errorText && (
          <p className="p-2 font-mono text-xs">{errorText}</p>
        )}
        {Output}
      </div>
    </div>
  );
};
