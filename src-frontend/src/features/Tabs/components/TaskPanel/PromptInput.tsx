import { Activity, useState } from "react";
import {
  PromptInput as BasePromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { ORCHESTRATOR_ID } from "@/constants/agent";
import type { AgentRead } from "@/types/agent";
import type { TaskType } from "@/types/task";
import { AgentSelector } from "./AgentSelector";

type PromptInputProps = {
  taskType: TaskType;
  onSubmit: (message: PromptInputMessage, agentId: number) => void;
};

export type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

export function PromptInput({ taskType, onSubmit }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentRead | null>(null);
  const ableToSubmit =
    prompt.trim() !== "" &&
    (taskType === "orchestration" || selectedAgent !== null);

  return (
    <BasePromptInput
      className="rounded-md bg-background"
      onSubmit={(message) =>
        onSubmit(message, selectedAgent?.id ?? ORCHESTRATOR_ID)
      }
    >
      <PromptInputBody>
        <PromptInputTextarea
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <Activity mode={taskType === "agent" ? "visible" : "hidden"}>
            <AgentSelector
              value={selectedAgent}
              onValueChange={setSelectedAgent}
            />
          </Activity>
          <Activity mode={taskType === "orchestration" ? "visible" : "hidden"}>
            <Button variant="outline" disabled>
              Agent
            </Button>
          </Activity>
        </PromptInputTools>
        <PromptInputSubmit disabled={!ableToSubmit} />
      </PromptInputFooter>
    </BasePromptInput>
  );
}
