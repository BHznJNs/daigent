import type { ChatStatus } from "ai";
import { ChevronsUpDownIcon, Loader2Icon } from "lucide-react";
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
import { SingleSelectDialog } from "@/components/custom/dialog/SingleSelectDialog";
import { Button } from "@/components/ui/button";
import { ORCHESTRATOR_ID } from "@/constants/agent";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { AgentRead } from "@/types/agent";
import type { TaskRead, TaskType } from "@/types/task";
import type { TaskState } from "./use-task-runner";

type AgentSelectDialogProps = {
  value: AgentRead | null;
  onValueChange: (agent: AgentRead | null) => void;
};

function AgentSelectDialog({ value, onValueChange }: AgentSelectDialogProps) {
  const { currentWorkspace, isLoading } = useWorkspaceStore();
  const agents = currentWorkspace?.usable_agents ?? [];

  let buttonText = "Select agent";
  if (isLoading) {
    buttonText = "Loading...";
  } else if (value) {
    buttonText = value.name;
  }

  return (
    <SingleSelectDialog
      value={value ?? undefined}
      selections={agents}
      getKey={(agent) => agent.id}
      getValue={(agent) => agent.name}
      onSelect={onValueChange}
      placeholder="Search agent..."
      emptyText="No agent found."
    >
      <Button
        variant="outline"
        role="combobox"
        className="justify-between"
        disabled={isLoading}
      >
        {buttonText}
        {isLoading ? (
          <Loader2Icon className="ml-2 size-4 shrink-0 animate-spin" />
        ) : (
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        )}
      </Button>
    </SingleSelectDialog>
  );
}

type PromptInputProps = {
  taskType: TaskType;
  taskData: TaskRead | null;
  taskState: TaskState;
  onSubmit: (message: PromptInputMessage, agentId: number) => void;
  onCancel?: () => void;
};

export type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

const stateMapping = {
  idle: "ready",
  waiting: "submitted",
  running: "streaming",
} satisfies Record<TaskState, ChatStatus>;

export function PromptInput({
  taskType,
  taskData,
  taskState,
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
        if (taskState === "idle") {
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
            <AgentSelectDialog
              value={selectedAgent}
              onValueChange={setSelectedAgent}
            />
          </Activity>
          <Activity mode={taskType === "orchestration" ? "visible" : "hidden"}>
            <Button variant="outline" disabled>
              Orchestrator
            </Button>
          </Activity>
        </PromptInputTools>
        <PromptInputSubmit
          status={stateMapping[taskState]}
          disabled={(() => {
            if (taskState === "running") {
              return false;
            }
            if (taskState === "waiting") {
              return true;
            }
            return !ableToSubmit;
          })()}
          onClick={() => {
            if (taskState === "running") {
              onCancel?.();
            }
          }}
        />
      </PromptInputFooter>
    </BasePromptInput>
  );
}
