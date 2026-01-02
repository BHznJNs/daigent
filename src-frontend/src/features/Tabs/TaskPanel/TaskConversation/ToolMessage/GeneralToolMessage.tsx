import { Activity, useMemo } from "react";
import {
  Tool,
  ToolContent,
  ToolHeader,
  type ToolHeaderProps,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import type { ToolMessage as ToolMessageType } from "@/types/message";

type ToolState =
  | "approval-requested"
  | "approval-responded"
  | ToolHeaderProps["state"];

export type GeneralToolMessageProps = {
  message: ToolMessageType;
  onCustomToolAction?: (
    toolMessageId: string,
    event: string,
    data: string
  ) => void;
};

export function GeneralToolMessage({ message }: GeneralToolMessageProps) {
  const toolState: ToolState = (() => {
    if (message.error) {
      return "output-error";
    }
    if (message.result) {
      return "output-available";
    }
    if (message.id && message.name && message.arguments) {
      return "approval-requested";
    }
    return "input-streaming";
  })();
  const inputObj = useMemo(
    () => JSON.parse(message.arguments),
    [message.arguments]
  );
  return (
    <Tool defaultOpen={toolState === "approval-requested"}>
      <ToolHeader
        type={`tool-${message.name}`}
        state={toolState as ToolHeaderProps["state"]}
      />
      <ToolContent>
        <ToolInput input={inputObj} />
        <Activity
          mode={(message.result ?? message.error) ? "visible" : "hidden"}
        >
          <ToolOutput
            output={message.result}
            errorText={message.error ?? undefined}
          />
        </Activity>
      </ToolContent>
    </Tool>
  );
}
