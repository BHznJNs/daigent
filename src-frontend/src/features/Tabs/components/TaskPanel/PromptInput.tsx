import { Activity, useEffect, useState } from "react";
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
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { AgentRead } from "@/types/agent";
import type { TaskRead, TaskType } from "@/types/task";
import { AgentSelector } from "./AgentSelector";

type PromptInputProps = {
  taskType: TaskType;
  taskData: TaskRead | null;
  isTaskRunning: boolean;
  onSubmit: (message: PromptInputMessage, agentId: number) => void;
  onCancel?: () => void;
};

export type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

export function PromptInput({
  taskType,
  taskData,
  isTaskRunning,
  onSubmit,
  onCancel,
}: PromptInputProps) {
  const { currentWorkspace } = useWorkspaceStore();
  const [prompt, setPrompt] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentRead | null>(null);
  const ableToSubmit =
    prompt.trim() !== "" &&
    (taskType === "orchestration" || selectedAgent !== null);

  useEffect(() => {
    if (taskData) {
      const initialAgent = currentWorkspace?.usable_agents.find(
        (a) => a.id === taskData?.agent_id
      );
      setSelectedAgent(initialAgent ?? null);
    }
  }, [taskData, currentWorkspace]);

  return (
    <BasePromptInput
      className="rounded-md bg-background"
      onSubmit={(message) => {
        if (isTaskRunning) {
          onCancel?.();
        } else {
          setPrompt("");
          onSubmit(message, selectedAgent?.id ?? ORCHESTRATOR_ID);
        }
      }}
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
        <PromptInputSubmit
          status={isTaskRunning ? "streaming" : "ready"}
          disabled={!(isTaskRunning || ableToSubmit)}
        />
      </PromptInputFooter>
    </BasePromptInput>
  );
}
