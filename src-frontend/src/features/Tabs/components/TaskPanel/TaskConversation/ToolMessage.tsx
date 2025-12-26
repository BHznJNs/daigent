import { MessageCircleQuestionMark, SendIcon } from "lucide-react";
import { Activity, useState } from "react";
import {
  Tool,
  ToolContent,
  ToolHeader,
  type ToolHeaderProps,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { CustomTool } from "@/components/custom/ai-components/CustomTool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ToolMessage as ToolMessageType } from "@/types/message";

type ToolState =
  | "approval-requested"
  | "approval-responded"
  | ToolHeaderProps["state"];

type AskUserToolMessageProps = ToolMessageProps;

function AskUserToolMessage({
  message,
  onCustomToolAction,
}: AskUserToolMessageProps) {
  const question = message.arguments.question as string;
  const options = message.arguments.options as string[] | null | undefined;
  const selectedOption = options && (message.result as string);
  const hasResult = message.result !== null;

  const [answer, setAnswer] = useState("");

  const handleSelectOption = (option: string) => {
    onCustomToolAction?.(message.id, "select", option);
  };

  const handleSendAnswer = () => {
    onCustomToolAction?.(message.id, "text", answer);
  };

  return (
    <CustomTool
      title="Dai 有个问题："
      icon={
        <MessageCircleQuestionMark className="size-4 text-muted-foreground" />
      }
    >
      <p className="font-medium text-sm">{question}</p>
      {options && (
        <div className="flex flex-col items-start justify-center gap-y-2">
          {options.map((option) => (
            <Button
              key={option}
              disabled={hasResult}
              variant={option === selectedOption ? "default" : "outline"}
              onClick={() => handleSelectOption(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      )}
      {options ? null : (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            disabled={hasResult}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <Button disabled={hasResult} onClick={handleSendAnswer}>
            <SendIcon />
          </Button>
        </div>
      )}
    </CustomTool>
  );
}

type ToolMessageProps = {
  message: ToolMessageType;
  onCustomToolAction?: (
    toolMessageId: string,
    event: string,
    data: unknown
  ) => void;
};

function GeneralToolMessage({ message }: ToolMessageProps) {
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
  return (
    <Tool defaultOpen={toolState === "approval-requested"}>
      <ToolHeader
        type={`tool-${message.name}`}
        state={toolState as ToolHeaderProps["state"]}
      />
      <ToolContent>
        <ToolInput input={message.arguments} />
        <Activity
          mode={(message.result ?? message.error) ? "visible" : "hidden"}
        >
          <ToolOutput output={message.result} errorText={message.error} />
        </Activity>
      </ToolContent>
    </Tool>
  );
}

export function ToolMessage({ message, onCustomToolAction }: ToolMessageProps) {
  if (message.name === "ask_user") {
    return (
      <AskUserToolMessage
        message={message}
        onCustomToolAction={onCustomToolAction}
      />
    );
  }
  return (
    <GeneralToolMessage
      message={message}
      onCustomToolAction={onCustomToolAction}
    />
  );
}
