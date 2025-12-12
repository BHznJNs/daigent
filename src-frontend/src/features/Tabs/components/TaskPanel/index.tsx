import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { createTask, resumeTask } from "@/api/task";
import { useTabsStore } from "@/stores/tabs-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Tab } from "@/types/tab";
import { PromptInput, type PromptInputMessage } from "./PromptInput";

type TaskPanelProps = {
  tabData: Tab;
};

export function TaskPanel({ tabData }: TaskPanelProps) {
  const { currentWorkspace } = useWorkspaceStore();
  const { updateTab } = useTabsStore();
  const sseAbortController = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (taskRead) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      updateTab({
        ...tabData,
        metadata: {
          isDraft: false,
          ...taskRead,
        },
      });
    },
  });

  useEffect(() => {
    if (tabData.metadata.isDraft) {
      return;
    }
    const abortController = resumeTask(tabData.metadata.id, null, {
      onAssistantChunk: (chunk) => {
        console.log("assistant chunk:", chunk);
      },
      onTool: (tool) => {
        console.log("tool:", tool);
      },
      onError: (error) => {
        console.error("sse error:", error);
      },
      onClose: () => {
        console.log("sse closed");
      },
    });
    sseAbortController.current = abortController;
    return () => {
      abortController.abort();
      if (sseAbortController.current === abortController) {
        sseAbortController.current = null;
      }
    };
  }, [tabData.metadata.isDraft]);

  const handleSubmit = async (message: PromptInputMessage, agentId: number) => {
    if (!currentWorkspace) {
      throw new Error("No current workspace");
    }
    if (tabData.metadata.isDraft) {
      await createTaskMutation.mutateAsync({
        title: tabData.title,
        type: tabData.metadata.type,
        agent_id: agentId,
        workspace_id: currentWorkspace.id,
        messages: [
          {
            role: "user",
            content: message.text,
            metadata: {
              // TODO: support file upload
            },
          },
        ],
      });
    }
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex-1">Task Panel</div>
      <PromptInput taskType={tabData.metadata.type} onSubmit={handleSubmit} />
    </div>
  );
}
